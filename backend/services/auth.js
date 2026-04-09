import bcrypt from 'bcryptjs';
import {pool} from "./dbSession.js";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {AppError, catchAsync} from "../utils/errorHandler.js";

// Chiave Segreta per JWT
const JWT_SECRET = process.env.NODE_ENV === 'production'
	? (process.env.JWT_SECRET || 'super-secret-production-key')
	: crypto.randomBytes(64).toString();

const isAuthDisabled = process.env.AUTH_ENABLED === 'false';

// Middleware per verificare il Token JWT
export const authenticateTokenFn = (req, res, next) => {
	// Se l'autenticazione è disabilitata, saltiamo la verifica
	if (isAuthDisabled) {
		return next();
	}

	const authHeader = req.headers['authorization'];
	const token = authHeader?.split(' ')[1]; // Bearer TOKEN

	if (!token) return next(new AppError('Token mancante', 401));

	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) return next(new AppError('Token non valido', 403));
		req.user = user;
		next();
	});
};

export const loginFn = catchAsync(async (req, res, next) => {
	const {username, password} = req.body;
	// Validazione base
	if (!username || !password) {
		return next(new AppError('Inserisci username e password', 400));
	}

	const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

	if (result.rows.length === 0) {
		return next(new AppError('Credenziali non valide', 401));
	}

	const user = result.rows[0];
	const validPass = await bcrypt.compare(password, user.password);

	if (!validPass) {
		return next(new AppError('Credenziali non valide', 401));
	}

	const token = jwt.sign(
		{id: user.id, username: user.username, role: user.role},
		JWT_SECRET,
		{expiresIn: '1h'}
	);

	res.status(200).json({
		status: 'success',
		data: {
			token,
			user: {username: user.username, role: user.role}
		}
	});
});
