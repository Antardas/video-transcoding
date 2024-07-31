// logger.js

import { createLogger as winstonCreateLogger, format, transports } from 'winston';
const { combine, timestamp, printf, colorize, label, json, prettyPrint } = format;

export default function createLogger(logLabel: string) {
	const logFormat = printf(({ level, message, timestamp, label }) => {
		return `${timestamp} [${label}] ${level}: ${message}`;
	});

	// Create the logger instance
	const logger = winstonCreateLogger({
		level: 'info',
		format: combine(
			label({ label: logLabel }),
			timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
			colorize(),
			prettyPrint(),
			json(),
			logFormat
		),
		transports: [new transports.Console()],
	});

	return logger;
}
