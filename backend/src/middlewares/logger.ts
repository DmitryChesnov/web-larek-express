import winston from 'winston';
import expressWinston from 'express-winston';
import path from 'path';

// Создаем директорию для логов если ее нет
import fs from 'fs';

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Формат логов
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Логгер запросов
export const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'request.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  format: logFormat,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
  colorize: false,
  ignoreRoute: (req, _res) => req.url.includes('/images/') || req.url === '/health',
});

// Логгер ошибок
export const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  format: logFormat,
});

// Консольный логгер для разработки
export const consoleLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: [new winston.transports.Console()],
});
