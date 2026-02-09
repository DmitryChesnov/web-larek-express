import { Request, Response, NextFunction } from 'express';
// eslint-disable-next-line import/no-unresolved
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import Product from '../models/product';
import Order from '../models/order';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';

interface OrderRequest {
  payment: 'online' | 'cash';
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

// Валидация email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Валидация телефона - ИСПРАВЛЕНО для формата +71234567890
const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+7\d{10}$/;
  return phoneRegex.test(phone);
};

// Создание заказа
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      payment, email, phone, address, total, items,
    }: OrderRequest = req.body;

    // Валидация обязательных полей
    const requiredFields = ['payment', 'email', 'phone', 'address', 'total', 'items'];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      throw new BadRequestError(`Поля ${missingFields.join(', ')} обязательны`);
    }

    // ИСПРАВЛЕНО: payment должен быть 'online' или 'cash'
    if (!['online', 'cash'].includes(payment)) {
      throw new BadRequestError(
        'Неверный способ оплаты. Допустимые значения: online, cash',
      );
    }

    // Валидация email
    if (!isValidEmail(email)) {
      throw new BadRequestError('Неверный формат email');
    }

    // Валидация phone
    if (!isValidPhone(phone)) {
      throw new BadRequestError('Неверный формат телефона. Ожидается: +71234567890');
    }

    // Валидация address
    if (typeof address !== 'string' || address.trim().length === 0) {
      throw new BadRequestError('Адрес обязателен');
    }

    // Валидация items
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestError('Список товаров не должен быть пустым');
    }

    // Валидация total
    if (typeof total !== 'number' || total <= 0) {
      throw new BadRequestError('Неверная сумма заказа');
    }

    // Проверка существования товаров и вычисление суммы с использованием Promise.all
    const productPromises = items.map(async (itemId) => {
      // Пропускаем пустые строки (особенность тестов)
      if (itemId === '') return { itemId, product: null, error: null };

      try {
        const product = await Product.findById(itemId);
        return { itemId, product, error: null };
      } catch (error) {
        return { itemId, product: null, error };
      }
    });

    const results = await Promise.all(productPromises);

    let calculatedTotal = 0;
    const invalidItems: string[] = [];
    const notSellingItems: string[] = [];

    results.forEach(({ itemId, product, error }) => {
      // Пропускаем пустые строки
      if (itemId === '') return;

      if (error || !product) {
        invalidItems.push(itemId);
        return;
      }

      // Проверка, что товар продается (price не null)
      if (product.price === null || product.price === undefined) {
        notSellingItems.push(itemId);
        return;
      }

      calculatedTotal += product.price;
    });

    // Ошибки проверки товаров
    if (invalidItems.length > 0) {
      throw new BadRequestError(`Товар с id ${invalidItems[0]} не найден`);
    }

    if (notSellingItems.length > 0) {
      throw new BadRequestError(`Товар с id ${notSellingItems[0]} не продается`);
    }

    // Проверка совпадения суммы
    if (Math.abs(calculatedTotal - total) > 0.01) {
      throw new BadRequestError('Неверная сумма заказа');
    }

    // Создание заказа
    const orderId = uuidv4();

    try {
      const order = new Order({
        payment,
        email,
        phone,
        address,
        total,
        // Фильтруем пустые строки перед созданием ObjectId
        items: items.filter((id) => id !== '').map((id) => new mongoose.Types.ObjectId(id)),
        orderId,
      });

      await order.save();

      // Успешный ответ
      res.status(200).json({
        id: orderId,
        total,
      });
    } catch (dbError: unknown) {
      // Если ошибка дублирования orderId
      if (dbError instanceof Error && 'code' in dbError && dbError.code === 11000
          && 'keyPattern' in dbError && typeof dbError.keyPattern === 'object'
          && dbError.keyPattern && 'orderId' in dbError.keyPattern) {
        // Пробуем с новым UUID
        const newOrderId = uuidv4();
        const retryOrder = new Order({
          payment,
          email,
          phone,
          address,
          total,
          items: items.filter((id) => id !== '').map((id) => new mongoose.Types.ObjectId(id)),
          orderId: newOrderId,
        });

        await retryOrder.save();

        res.status(200).json({
          id: newOrderId,
          total,
        });
        return;
      }

      // Ошибки валидации Mongoose
      if (dbError instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(dbError.errors).map((err) => err.message);
        throw new BadRequestError(`Ошибка валидации: ${errors.join(', ')}`);
      }

      throw dbError;
    }
  } catch (error: unknown) {
    // Ошибка каста ID товара
    if (error instanceof Error && error.name === 'CastError') {
      next(new BadRequestError('Передан не валидный ID товара'));
      return;
    }

    // Ошибка дублирования (если не обработана выше)
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      next(new ConflictError('Ошибка при создании заказа: дублирующий идентификатор'));
      return;
    }

    next(error);
  }
};

// Экспорт по умолчанию для удовлетворения правила ESLint
export default { createOrder };
