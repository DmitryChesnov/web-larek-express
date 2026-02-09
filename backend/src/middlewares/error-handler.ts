import { Request, Response, NextFunction } from 'express';
import { CelebrateError } from 'celebrate';

export default function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Если это ошибка celebrate/joi
  if (err instanceof CelebrateError) {
    const errorDetails = err.details.get('body')
      || err.details.get('params')
      || err.details.get('query');

    return res.status(400).json({
      message: 'Ошибка валидации',
      details: errorDetails?.details.map((detail) => ({
        message: detail.message,
        path: detail.path.join('.'),
      })),
    });
  }

  // Если это кастомная ошибка
  const anyErr = err as any;
  if (anyErr.statusCode) {
    return res.status(anyErr.statusCode).json({
      message: anyErr.message,
      status: 'error',
    });
  }

  // Если это ошибка Mongoose (валидация схемы)
  if (err.name === 'ValidationError') {
    const mongooseErr = err as any;
    return res.status(400).json({
      message: 'Ошибка валидации данных',
      details: Object.values(mongooseErr.errors).map((error: any) => ({
        field: error.path,
        message: error.message,
      })),
    });
  }

  // Если это ошибка уникальности Mongoose
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    return res.status(409).json({
      message: 'Запись с такими данными уже существует',
      status: 'error',
    });
  }

  // Внутренняя ошибка сервера
  return res.status(500).json({
    message: 'Внутренняя ошибка сервера',
    status: 'error',
  });
}
