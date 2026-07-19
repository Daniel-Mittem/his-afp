# UF14 - Task 4: Il Tunnel per il Database

## 1. Obiettivo

Permettere a strumenti esterni (DBeaver, TablePlus, ecc.) di collegarsi al database Postgres passando
esclusivamente dal Gateway, senza mai esporre direttamente la porta del container `db` verso l'host.

## 2. Perché serve un file `nginx.conf` nuovo

Fino alla Task 3, il Gateway montava solo `conf.d/` (i file con i blocchi `server` per PROD/TEST/SVI),
lasciando l'`nginx.conf` principale a quello di default incluso nell'immagine `nginx:alpine`. Quel file
dichiara solo il contesto `http {}`.

Il database non parla HTTP: Postgres usa un proprio protocollo binario su TCP. Il modulo NGINX che gestisce
proxy a livello di trasporto (TCP/UDP) si chiama **`stream`**, ed è un blocco che vive allo stesso livello di
`http {}` — non può essere annidato in un file di `conf.d/` incluso dentro `http {}`, altrimenti la sintassi
non è valida (il parser NGINX si aspetterebbe direttive HTTP, non un secondo `server` che ascolta TCP puro).

Per questo è stato introdotto `gateway/nginx.conf`, che sostituisce l'`nginx.conf` di default dell'immagine e
dichiara sia `http {}` (che include ancora `conf.d/*.conf` come prima) sia `stream {}` come blocco separato.

L'immagine ufficiale `nginx:alpine` compila il modulo `stream` in modo statico (non richiede `load_module`),
quindi il blocco funziona così com'è, senza configurazioni aggiuntive nel Dockerfile del Gateway (che resta
l'immagine `nginx:alpine` non modificata).

## 3. Cosa contiene il blocco `stream`

```nginx
stream {
    log_format  db_tunnel  '$remote_addr [$time_local] '
                            'bytes_sent=$bytes_sent bytes_received=$bytes_received '
                            'session_time=$session_time status=$status';
    access_log /var/log/nginx/db_tunnel.log db_tunnel;

    server {
        listen 5432;
        proxy_pass db:5432;
    }
}
```

- `listen 5432`: il Gateway apre la 5432 in ascolto, esattamente come farebbe Postgres.
- `proxy_pass db:5432`: tutto il traffico TCP ricevuto viene inoltrato al servizio `db` sulla `backend-net`,
  raggiungibile dal Gateway perché è l'unico container collegato a entrambe le reti.
- `access_log` con un `log_format` dedicato: a differenza del blocco `http`, lo `stream` non ha concetti come
  URL o status code HTTP, ma espone comunque variabili utili per audit (`$bytes_sent`, `$bytes_received`,
  `$session_time`, `$status` come esito della connessione TCP) — coerente con la richiesta del cliente che il
  traffico verso il DB sia "mediato e registrato dal Gateway".

## 4. Modifiche al `docker-compose.yml`

```yaml
gateway:
  ports:
    - "80:80"
    - "8080:8080"
    - "8999:8999"
    - "5432:5432"          # nuova: tunnel verso il DB
  volumes:
    - ./gateway/nginx.conf:/etc/nginx/nginx.conf:ro       # nuovo mount separato
    - ./gateway/default.conf:/etc/nginx/conf.d/default.conf:ro  # prima montava l'intera cartella
```

Due cambi rilevanti:

1. **Split dei mount**: prima l'intera cartella `./gateway` era montata su `/etc/nginx/conf.d/`. Se `nginx.conf`
   finisse anche lui dentro `conf.d/`, verrebbe incluso una seconda volta dal wildcard `include /etc/nginx/conf.d/*.conf;` dentro il proprio stesso `http {}`, causando un errore di sintassi (blocchi
   `events`/`http` annidati dove non sono ammessi). Per questo `nginx.conf` e `default.conf` sono ora montati
   come due file singoli, su percorsi diversi.
2. **Porta 5432 pubblicata solo dal Gateway**: il vincolo tecnico dell'esame resta rispettato — `db` continua a
   non avere alcuna direttiva `ports:` (rimossa già nella Task 1), l'unico container con porte verso l'host è
   `sio-gateway`, che ora ne espone quattro invece di tre.

## 5. Perché questa soluzione (e non esporre direttamente la porta del DB)

L'alternativa più semplice — riaggiungere `ports: "5432:5432"` su `db` — è esattamente ciò che il vincolo di
sicurezza dell'esame vieta, e per una buona ragione pratica oltre che formale: bypassando il Gateway, ogni
accesso al DB smette di passare da un punto di controllo unico. Con il tunnel via `stream`:

- Se domani serve revocare l'accesso al DB dall'esterno, basta rimuovere il blocco `stream` (o commentare
  `listen 5432`) e ricaricare `nginx -s reload`, senza toccare né riavviare il database — esattamente la
  richiesta esplicita del cliente nella nota.
- Tutto il traffico verso il DB passa da un solo componente monitorabile (i log di `db_tunnel.log`), invece che
  da un accesso diretto e non tracciato al container.

## 6. Guida ai Test

```powershell
# 1. Verificare che il DB non sia raggiungibile se non tramite Gateway
#    (il container db non deve avere porte pubblicate)
docker compose ps
# sio-postgres non deve mostrare alcuna colonna PORTS con 0.0.0.0:...

# 2. Connessione dal Gateway (deve funzionare)
docker exec sio-postgres pg_isready -h localhost -p 5432
Test-NetConnection -ComputerName localhost -Port 5432
# Atteso: TcpTestSucceeded : True, perché ora è il Gateway (sulla 5432
# pubblicata) a rispondere, inoltrando internamente a db:5432.

# 3. Connessione reale con un client Postgres (psql, DBeaver, TablePlus...)
#    puntato a localhost:5432, credenziali quelle di .env / docker-compose:
psql -h localhost -p 5432 -U sio_user -d sio_db -c "\dt sio.*"
# Atteso: lista delle tabelle dello schema sio, identica a quella ottenibile
# con "docker exec sio-postgres psql ...". Il client non si accorge di
# parlare con un tunnel invece che con Postgres direttamente.

# 4. Verifica del logging del tunnel
docker exec sio-gateway cat /var/log/nginx/db_tunnel.log
# Atteso: una riga per ogni connessione TCP inoltrata, con IP sorgente,
# byte trasferiti e durata della sessione.

# 5. Verifica di revoca rapida dell'accesso
#    Commentare il blocco "server { listen 5432; ... }" in gateway/nginx.conf
docker exec sio-gateway nginx -s reload
Test-NetConnection -ComputerName localhost -Port 5432
# Atteso: TcpTestSucceeded : False, senza aver toccato il container db.
```
