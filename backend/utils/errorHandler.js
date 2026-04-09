import {logger} from "../services/logger.js";
import {errorCounter} from "../services/metrics.js";

/**
 * Classe per errori operazionali (prevedibili).
 * Esempio: throw new AppError('Paziente non trovato', 404);
 */
export class AppError extends Error {
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
		this.isOperational = true; // Indica che è un errore gestito, non un bug
		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Wrapper per funzioni asincrone.
 * Elimina la necessità di try/catch in ogni controller.
 */
export const catchAsync = (fn) => {
	return (req, res, next) => {
		fn(req, res, next).catch(next); // Passa l'errore al Global Handler
	};
};

/**
 * Middleware Globale di Gestione Errori.
 * Da inserire come ULTIMO middleware in server.js.
 */
/**
 * Middleware Globale Gestione Errori
 */
export const globalErrorHandler = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	// 1. Normalizzazione Errori Noti (Postgres)
	let errorType = 'generic';

	if (err.code === '23505') { // Unique Violation (es. CF duplicato)
		err.statusCode = 409;
		err.message = 'Dato duplicato esistente nel sistema.';
		errorType = 'db_duplicate';
	} else if (err.code === '23503') { // FK Violation
		err.statusCode = 400;
		err.message = 'Riferimento a risorsa non valida (codice errato).';
		errorType = 'db_reference';
	} else if (err.isOperational) {
		errorType = 'operational'; // Errori lanciati da noi (es. 404 Not Found)
	} else {
		errorType = 'exception'; // Bug imprevisti (es. TypeError)
	}

	// 2. LOGGING (Winston)
	// Eseguiamo il log dello Stack Trace solo se è un errore server (500) o critico
	if (err.statusCode >= 500) {
		logger.error(`🔥 CRITICAL ERROR: ${err.message}`, {
			stack: err.stack,
			method: req.method,
			url: req.originalUrl,
			body: req.body
		});
	} else {
		if (err.statusCode === 401) {
			res.setHeader('WWW-Authenticate', 'Bearer realm="sio"');
		}
		logger.warn(`⚠️ HANDLED ERROR: ${err.message}`, {
			code: err.statusCode,
			url: req.originalUrl
		});
	}

	// 3. METRICHE (Prometheus)
	// Incrementiamo il contatore per permettere alert su Grafana
	errorCounter.inc({
		type: errorType,
		code: err.statusCode,
		route: req.route ? req.route.path : 'unknown'
	});

	// 4. RISPOSTA AL CLIENT
	res.status(err.statusCode).json({
		status: err.status,
		code: err.statusCode,
		message: err.message,
		...(process.env.NODE_ENV !== 'production' && {stack: err.stack})
	});
};
