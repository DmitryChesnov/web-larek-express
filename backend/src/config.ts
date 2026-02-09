import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

export default {
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/weblarek',
  nodeEnv: process.env.NODE_ENV || 'development',
  logDir: process.env.LOG_DIR || 'logs',
};
