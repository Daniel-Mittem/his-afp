# UF14 - Task 3: Zero-Downtime Backend & Database Migration

## 1. Obiettivo

Estendere lo schema Blue/Green della Task 2 al caso in cui la nuova versione del backend (Green) richieda una
modifica alla struttura del Database, senza interrompere il servizio fornito da Blue e senza corrompere i dati.

## 2. Punto di partenza: cosa fornisce già la Task 2

`backend-blue` e `backend-green` esistono già come container separati (`sio-backend-blue`, `sio-backend-green`),
entrambi collegati allo stesso servizio `db` sulla `backend-net`, senza porte pubblicate verso l'host. Non ci
sono conflitti di porta tra le due istanze perché nessuna delle due espone porte sull'host: comunicano solo
internamente via Docker DNS, ciascuna sulla propria porta interna 3000 nel proprio namespace di rete per
container. La parte di orchestrazione Docker richiesta dalla Task 3 era quindi già coperta dalla Task 2.

## 3. Gateway Routing: consolidamento in un `upstream`

Nella Task 2, lo switch Blue/Green richiedeva modificare manualmente 3 blocchi `location /api/` distinti
(ambiente PROD, TEST, SVI) nel file `gateway/default.conf`, ciascuno con il proprio `proxy_pass`.

Per la Task 3 questo è stato consolidato in un unico blocco `upstream`:

```nginx
upstream sio_backend_active {
    server sio-backend-blue:3000;
}
```

Tutti e tre i blocchi `location /api/` ora puntano a `http://sio_backend_active;` invece che direttamente al
nome del container. Lo switch Blue/Green diventa quindi una modifica di **una sola riga** (il `server` dentro
`upstream`), invece di doverla ripetere identica in tre punti del file — riducendo il rischio di
disallineamento tra ambienti durante uno switch reale. Il meccanismo di attivazione resta lo stesso della
Task 2: modificare la riga, poi `docker exec sio-gateway nginx -s reload`.

## 4. Il dilemma del Database: migrazioni additive

Il problema centrale: se Green richiede una nuova colonna obbligatoria e Blue è ancora attivo sullo stesso DB,
una migrazione "distruttiva" (rename, drop, `NOT NULL` senza default su una tabella con dati) rischia di
rompere Blue nel momento stesso in cui viene applicata, prima ancora che lo switch avvenga.

La soluzione adottata è il principio delle **migrazioni additive**: ogni modifica allo schema durante una
finestra Blue/Green attiva deve essere ininfluente per il codice che non la conosce ancora.

Regole applicate (vedi `db/migrations/002_add_patient_phone.sql` per un esempio concreto sulla tabella
`patients` del progetto):

1. **Solo `ADD COLUMN`, mai `RENAME`/`DROP`** finché Blue è in produzione: Blue semplicemente ignora una colonna
   che non referenzia nelle sue query, quindi non genera errori.
2. **Nuove colonne sempre nullable, senza `NOT NULL`**: se fosse `NOT NULL` senza default, ogni `INSERT`
   eseguito da Blue (che non imposta quel campo) fallirebbe immediatamente.
3. **Evitare `DEFAULT` che forzi la riscrittura fisica della tabella** su volumi di dati grandi, per mantenere
   il lock di schema breve (in Postgres, `ADD COLUMN` nullable senza `DEFAULT` è un'operazione di sola
   metadata, non riscrive le righe esistenti).
4. **Vincoli più stringenti (`NOT NULL`, `UNIQUE`, cambi di tipo) solo dopo aver dismesso Blue**, quando tutto
   il traffico è ormai su Green e si è certi che ogni nuova riga popoli correttamente il campo.

Questo approccio sposta il rischio dal momento della migrazione (che resta sempre sicura e reversibile) al
momento della dismissione di Blue, che è un evento controllato e pianificato, non un side-effect di un
deployment.

## 5. Impatto sul Frontend e sulle sessioni JWT

- **Il Frontend non necessita di reload o ricompilazione**: chiama sempre `/api/...` sul Gateway, che è
  l'endpoint stabile; l'istanza di backend che risponde (Blue o Green) è un dettaglio interno invisibile al
  Frontend, a patto che Green resti compatibile con il contratto API che il Frontend attualmente consuma.
- **Le sessioni JWT restano valide durante lo switch**: nella configurazione attuale, `backend-blue` e
  `backend-green` condividono lo stesso `JWT_SECRET`. La verifica di un token dipende solo dalla firma
  crittografica con quel secret, non dall'istanza che l'ha emesso. Un utente autenticato da Blue prima dello
  switch resta autenticato anche se la richiesta successiva viene servita da Green, senza necessità di
  ri-login.
- **Limite da segnalare**: questo funziona solo finché il *contratto* tra Frontend e backend (formati di
  risposta, claim nel JWT, struttura degli endpoint) resta compatibile tra Blue e Green. Una modifica breaking
  lato API richiederebbe di versionare anche il Frontend in coordinamento con lo switch, il che non è coperto
  da questa soluzione.

## 6. Guida ai Test

```powershell
# 1. Avvio con entrambe le istanze backend attive
docker compose up -d --build

# 2. Applicare la migrazione additiva sul DB in esecuzione (Blue è già attivo)
Get-Content db/migrations/002_add_patient_phone.sql | docker exec -i sio-postgres psql -U sio_user -d sio_db

# 3. Verificare che Blue continui a funzionare normalmente dopo la migrazione
curl.exe -I http://localhost/api/health

# 4. Verificare che Green veda la nuova colonna
docker exec sio-postgres psql -U sio_user -d sio_db -c "\d sio.patients"
# Atteso: la colonna 'telefono' è presente nello schema, visibile a entrambi
# i backend perché condividono lo stesso database.

# 5. Switch del traffico su Green: modificare gateway/default.conf
#    (upstream sio_backend_active -> server sio-backend-green:3000;)
docker exec sio-gateway nginx -s reload

# 6. Verificare continuità del servizio durante e dopo lo switch
curl.exe -I http://localhost/api/health

# 7. Rollback su Blue in caso di problemi: ripristinare la riga upstream
#    su sio-backend-blue:3000 e ricaricare di nuovo
docker exec sio-gateway nginx -s reload
```

Durante l'intera sequenza il Frontend non deve mai restituire un errore di connessione riconducibile
all'infrastruttura: la porta 80 del Gateway resta sempre in ascolto, e i dati scritti da una qualsiasi delle due
istanze restano coerenti e leggibili dall'altra, perché lo schema è stato esteso in modo retrocompatibile.
