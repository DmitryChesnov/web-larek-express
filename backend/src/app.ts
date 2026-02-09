import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import { errors } from 'celebrate';
import { requestLogger, errorLogger, consoleLogger } from './middlewares/logger';
import errorHandler from './middlewares/error-handler';
import routes from './routes';
import config from './config';

const app = express();

// Безопасность
app.use(helmet());
app.use(cors());

// Парсинг JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логгер запросов (подключается ДО всех обработчиков роутов)
app.use(requestLogger);

// Статические файлы
app.use('/images', express.static('public/images'));

// Роуты
app.use('/', routes);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Логгер ошибок (подключается ПОСЛЕ обработчиков роутов и ДО обработчиков ошибок)
app.use(errorLogger);

// Обработка ошибок celebrate
app.use(errors());

// Централизованный обработчик ошибок
app.use(errorHandler);

// Подключение к MongoDB
mongoose.set('strictQuery', true);
mongoose.connect(config.mongoURI)
  .then(() => {
    consoleLogger.info('Connected to MongoDB');
  })
  .catch((error) => {
    consoleLogger.error('MongoDB connection error:', error);
  });

const PORT = config.port || 3000;

app.listen(PORT, () => {
  consoleLogger.info(`Server is running on port ${PORT}`);
});

export default app;
