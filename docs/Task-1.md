# UF14 - Migrazione Architetturale: Isolamento di Rete Multi-Tier

## 1. Obiettivo

Trasformare l'infrastruttura HIS-AFP da rete piatta a un'architettura **Multi-Tier a compartimenti stagni**,
isolando i frontend dal Database/Backend, con il Gateway come unico punto di mediazione del traffico.

## 2. Architettura Prima

Tutti i servizi (`db`, `backend`, `fe-prod`, `fe-test`, `fe-sio`, `gateway`) erano collegati alla rete Docker
di default creata implicitamente da Compose (`his-afp_default`). Nessuna rete era dichiarata esplicitamente nel
`docker-compose.yml`.

```
┌──────────────────────────────────────────────────┐
│              his-afp_default (rete unica)        │
│                                                  │
│  fe-prod   fe-test   fe-sio   backend   db       │
│  (80)      (80)      (80)     (3000)    (5432)   │
│                                                  │
│              gateway (80/8080/8999)              │
└──────────────────────────────────────────────────┘
```

Inoltre `db` esponeva la porta `5432:5432` direttamente verso l'host.

**Problemi:**

- Qualsiasi frontend compromesso poteva risolvere via DNS e contattare direttamente `db` e `backend`, perché
  tutti i container condividevano la stessa rete e quindi lo stesso namespace DNS interno.
- La porta del Database era raggiungibile anche dall'host, ampliando la superficie di attacco oltre il perimetro
  Docker.
- Un'architettura di questo tipo non è idonea a gestire dati sanitari reali: non supererebbe un audit di
  sicurezza per l'accreditamento regionale, perché non implementa nessuna segregazione tra la zona di
  distribuzione contenuti (frontend) e la zona dati sensibili (backend + DB).

## 3. Architettura Dopo

Sono state introdotte due reti Docker separate, dichiarate esplicitamente nel `docker-compose.yml`:

- **`frontend-net`**: contiene `fe-prod`, `fe-test`, `fe-sio`.
- **`backend-net`**: contiene `backend` e `db`.
- **`gateway`**: unico servizio collegato a *entrambe* le reti, agisce da bridge applicativo controllato.

```
┌──────────────────────┐        ┌──────────────────────┐
│   frontend-net       │        │    backend-net       │
│                      │        │                      │
│  fe-prod  fe-test    │        │  backend    db       │
│  fe-sio              │        │  (3000)    (5432)    │
│                      │        │                      │
└──────────┬───────────┘        └───────────┬──────────┘
           │                                │
           └────────────► gateway ◄─────────┘
                    (80 / 8080 / 8999 esposte)
```

Modifiche applicate:

1. Aggiunta della sezione `networks:` a livello di root del compose, con `frontend-net` e `backend-net` (driver
   `bridge`, reti Docker isolate l'una dall'altra: due bridge distinti non condividono lo stesso namespace DNS
   e non instradano traffico tra loro senza un componente esplicitamente collegato a entrambe).
2. Ogni servizio ha ora una direttiva `networks:` esplicita che lo assegna alla rete corretta.
3. `gateway` è l'unico servizio con `networks: [frontend-net, backend-net]`, in linea col vincolo "unico punto
   di controllo del dialogo tra le due zone".
4. Rimossa la direttiva `ports: "5432:5432"` dal servizio `db`: il Database non è più raggiungibile dall'host,
   solo dai servizi sulla `backend-net`.
5. `gateway` resta l'unico servizio con `ports:` verso l'host (`80`, `8080`, `8999`) — nessun altro container
   espone porte, come richiesto dai vincoli tecnici dell'esame.

## 4. Perché questa migrazione

Il vincolo di sicurezza chiedeva che fosse *tecnicamente impossibile* per `fe-prod` vedere o pingare `db`, non
solo "bloccato a livello applicativo". Le alternative scartate:

- **Firewall/iptables manuali dentro i container**: fragile, richiede manutenzione continua, e comunque i
  container resterebbero sulla stessa rete Docker (il DNS li risolverebbe comunque).
- **Un'unica rete con regole di autorizzazione a livello backend**: non impedisce la risoluzione DNS né il
  ping/probe di rete, lascia comunque visibile la topologia interna a un attaccante.

La separazione a livello di rete Docker è la soluzione corretta perché sposta il controllo dal livello
applicativo (bypassabile) al livello di rete (protocollo): un container su `frontend-net` semplicemente non ha
una voce DNS per `db`, perché non fa parte di quel namespace di rete.

## 5. Guida ai Test

Tutti i test vanno eseguiti passando dal Gateway (per le API) o verificando direttamente l'isolamento di rete
tra i container (per la Task 1). Nessun test deve bypassare il Gateway parlando direttamente con un container
interno.

### 5.1 Avvio dell'infrastruttura

```bash
docker compose up -d --build
docker compose ps
```

Verificato che **solo** `sio-gateway` abbia porte mappate verso l'host (colonna `PORTS` negli altri container
deve essere vuota).

### 5.2 Verifica isolamento frontend → database (test principale, obbligatorio)

```bash
docker exec sio-fe-prod getent hosts db
```

**Risultato: il comando fallisce** (nessun output, exit code diverso da 0), perché `db` non è sulla
`frontend-net` e quindi non esiste per il resolver DNS interno di `fe-prod`.

In alternativa, se il container frontend include `ping`:

```bash
docker exec sio-fe-prod ping -c 1 db
```

Atteso: `ping: bad address 'db'` o timeout di risoluzione.

### 5.3 Verifica che il DB non sia raggiungibile dall'host

```bash
Test-NetConnection -ComputerName localhost -Port 5432
```

Atteso: connessione rifiutata / nessuna porta in ascolto sull'host.

### 5.4 Verifica che il Gateway funzioni ancora correttamente end-to-end

```bash
curl.exe -I http://localhost:80/
curl.exe -I http://localhost:80/api/health
```

Atteso: risposte HTTP valide, a dimostrazione che il Gateway (collegato a entrambe le reti) continua a
raggiungere sia i frontend sia il backend, nonostante la segmentazione.

### 5.5 Verifica positiva del collegamento backend ↔ db

```bash
docker exec sio-backend getent hosts db
```

Atteso: risoluzione riuscita (backend e db condividono `backend-net`), a conferma che l'isolamento è mirato
solo alla `frontend-net` e non rompe il funzionamento dell'applicazione.
