import express from 'express';
import cors from 'cors';
import responseTime from "response-time";
import {authenticateTokenFn, loginFn} from "./services/auth.js";
import {retrieveHealthStatusFn} from "./services/health.js";
import {
  retrieveTriageColorsFn,
  retrieveArrivalModesFn,
  retrievePathologiesFn
} from "./services/resources.js";
import {
  changeAdmissionsStatusByIDFn,
  insertNewAdmissionFn,
  retrieveActiveAdmissionsFn,
  retrieveAdmissionByIDFn,
  updatePatientInformationFn
} from "./services/patients.js";
import {logger} from "./services/logger.js";
import {AppError} from "./utils/errorHandler.js";
import {globalErrorHandler} from "./utils/errorHandler.js";
import {getContentType, getMetrics, httpRequestDurationMicroseconds} from "./services/metrics.js";

// --- CONFIGURAZIONE SERVER EXPRESS ---
const app = express();
const port = 3000;

// --- MIDDLEWARE GLOBALI ---
app.use(cors());
app.use(express.json());

// Middleware Metriche (Tempi di risposta)
app.use(responseTime((req, res, time) => {
  if (req.path === '/metrics') return; // Non tracciamo le chiamate a /metrics

  httpRequestDurationMicroseconds.labels(
      req.method,
      req.path,
      res.statusCode
  ).observe(time / 1000);
}));

// --- ENDPOINTS ---

// Metriche per Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', getContentType());
  res.send(await getMetrics());
});

// --- HEALTH CHECK ---
app.get('/health', retrieveHealthStatusFn);

// --- API ENDPOINTS ---
// 1. LOGIN
app.post('/auth/login', loginFn);

// 2. CONFIGURAZIONI / RISORSE
app.get('/resources/triage-colors', authenticateTokenFn, retrieveTriageColorsFn);
app.get('/resources/pathologies', authenticateTokenFn, retrievePathologiesFn);
app.get('/resources/arrival-modes', authenticateTokenFn, retrieveArrivalModesFn);

// 3. GESTIONE PAZIENTI / ACCESSI
app.get('/admissions', authenticateTokenFn, retrieveActiveAdmissionsFn);
app.get('/admissions/:id', authenticateTokenFn, retrieveAdmissionByIDFn);
app.post('/admissions', authenticateTokenFn, insertNewAdmissionFn);
app.patch('/admissions/:id/status', authenticateTokenFn, changeAdmissionsStatusByIDFn);
app.patch('/patients/:id', authenticateTokenFn, updatePatientInformationFn);

// --- ROTTA NON TROVATA ---
app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Impossibile trovare ${req.originalUrl} su questo server`, 404));
});

// --- GLOBAL ERROR HANDLER ---
app.use(globalErrorHandler);

// Avvio Server
app.listen(port, () => {
  logger.info(`SIO Backend in ascolto sulla porta ${port}`);
});
