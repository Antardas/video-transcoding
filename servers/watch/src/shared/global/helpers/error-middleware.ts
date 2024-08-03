import { NextFunction, Request, Response } from 'express';
import AppError from './AppError';

// Global Error Handler
function errorMiddleware(err: AppError, _req: Request, res: Response, _next: NextFunction) {
	let error: AppError = err;
	error.statusCode = err.statusCode || 500;
	error.message = err.message || 'Internal Server Error';

	// Handle Wrong  JWT token
	if (err.name === 'JsonWebTokenError') {
		const message = 'Json Web Token Invalid Try again';
		error = new AppError(message, 400);
	}

	// Handle   JWT token expire error
	if (err.name === 'TokenExpiredError') {
		const message = 'Json Web Token expired,  Try again';
		error = new AppError(message, 400);
	}

	res.status(error.statusCode).json({
		success: false,
		message: error.message,
	});
}

export default errorMiddleware;
