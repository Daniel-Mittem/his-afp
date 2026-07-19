
# UF14 - Task 2: Blue/Green Switch del Backend

## 1. Obiettivo

Poter aggiornare il Backend senza interrompere il servizio API percepito dal Frontend: si accende una seconda
istanza (`backend-green`) con la nuova versione mentre quella corrente (`backend-blue`) resta attiva, poi si
sposta il traffico spostando solo la configurazione del Gateway.

## 2. Cosa è cambiato

### `docker-compose.yml`

Il singolo servizio `backend` è stato sostituito da due servizi identici a livello di build/immagine, ma con
`container_name` distinti:

- `backend-blue` → `sio-backend-blue`
- `backend-green` → `sio-backend-green`

Entrambi:

- usano lo stesso `./backend` come contesto di build 
- si connettono allo **stesso** servizio `db`,
- restano sulla `backend-net`, quindi invisibili dall'esterno e dai frontend, coerentemente con la Task 1.

### `gateway/default.conf`

Tutti i blocchi `location /api/` puntavano a `http://sio-backend:3000` (nome che non esiste più). Ora puntano a
`http://sio-backend-blue:3000`, che è l'istanza attiva di default.

## 3. Come si esegue lo switch Blue → Green

1. Assicurarsi che `backend-green` sia già up e sano:
   ```bash
   docker compose up -d backend-green
   docker exec sio-backend-green netstat -tulpn
   ```
2. Modificare `gateway/default.conf`, sostituendo `sio-backend-blue` con `sio-backend-green` nei blocchi
   `location /api/` che si vogliono spostare (si può spostare un solo ambiente per volta, es. solo PROD).
3. Ricaricare la configurazione del Gateway **senza riavviare il container**:
   ```bash
   docker exec sio-gateway nginx -s reload
   ```

   Il reload di nginx applica la nuova configurazione a caldo: le connessioni in corso vengono terminate in modo
   graceful, quelle nuove vanno subito su Green. Non c'è downtime percepibile dal Frontend, perché nginx non
   chiude la porta 80 in nessun momento.

## 4. Procedura di rollback

Se `backend-green` presenta un bug:

1. Ripristinare `sio-backend-blue` in `gateway/default.conf`.
2. `docker exec sio-gateway nginx -s reload`.

Il rollback è istantaneo quanto lo switch: è solo un cambio di una riga di configurazione + reload, nessun
rebuild o restart di container.

## 5. Riflessione: cosa succede ai dati se Green scrive e poi si fa rollback?

`backend-blue` e `backend-green` puntano allo **stesso** database (`db`). Questo significa:

- Se Green scrive un record nel DB e poi si fa rollback a Blue, **il dato rimane**: il rollback sposta solo il
  routing del traffico nel Gateway, non tocca in alcun modo il contenuto del database.
- Questo è corretto e voluto per la Task 2 (nessuna modifica allo schema richiesta), ma è anche il limite
  principale di questo approccio: se Green avesse scritto un dato in un formato incompatibile con Blue (es. un
  nuovo campo che Blue non si aspetta, o un valore in un range che Blue non gestisce), il rollback riporterebbe
  Blue a servire richieste ma senza risolvere l'inconsistenza già scritta nel DB.
- Per questo la Task 2 vieta esplicitamente modifiche allo schema: senza modifiche allo schema, Blue e Green
  sono compatibili con qualunque riga scritta dall'altro, quindi il rollback è sicuro. La gestione di modifiche
  di schema durante uno switch Blue/Green è il problema affrontato dalla Task 3 (migrazioni additive).

## 6. Guida ai test

```bash
# 1. Stato iniziale: verificare che l'API risponda passando da Blue
curl.exe -sS -I http://localhost/api/health

# 2. Avviare Green in parallelo
docker compose up -d backend-green
docker exec sio-backend-green getent hosts db   # deve risolvere: stesso db di Blue

# 3. Eseguire lo switch (modificare gateway/default.conf: sio-backend-blue -> sio-backend-green)
docker exec sio-gateway nginx -s reload

# 4. Verificare che l'API risponda ancora, ora servita da Green
curl -s http://localhost/api/health

# 5. Simulare un problema e fare rollback (rimodificare il conf su sio-backend-blue)
docker exec sio-gateway nginx -s reload
curl -s http://localhost/api/health   # deve tornare a rispondere, servito da Blue
```

Durante l'intera sequenza, il Frontend (`fe-prod`) non deve mai ricevere un errore di connessione: al massimo
una manciata di richieste in transito nel preciso istante del reload possono essere gestite dalla vecchia o
dalla nuova istanza, ma la porta 80 del Gateway resta sempre in ascolto.
