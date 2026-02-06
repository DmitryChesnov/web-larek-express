import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Product, { IProduct } from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';

// Получить все товары
export const getAllProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      items: products,
      total: products.length,
    });
  } catch (error) {
    next(error);
  }
};

// Создать новый товар
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      title, image, category, description, price,
    } = req.body;

    // Валидация обязательных полей
    if (!title || !image || !category) {
      throw new BadRequestError(
        'Пожалуйста, заполните все обязательные поля: title, image, category',
      );
    }

    // Проверка структуры image
    if (!image.fileName || !image.originalName) {
      throw new BadRequestError(
        'Поле image должно содержать fileName и originalName',
      );
    }

    // Проверка уникальности названия
    const existingProduct = await Product.findOne({ title });
    if (existingProduct) {
      throw new ConflictError('Товар с таким названием уже существует');
    }

    // Создание нового товара
    const productData: Partial<IProduct> = {
      title,
      image,
      category,
      description: description || '',
      price: price !== undefined ? price : null,
    };

    const product = await Product.create(productData);

    // ИСПРАВЛЕНО: статус 201 и поле id вместо _id
    res.status(201).json({
      id: product._id.toString(),
    });
  } catch (error: any) {
    // Обработка ошибок валидации Mongoose
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      next(new BadRequestError(`Ошибка валидации: ${errors.join(', ')}`));
      return;
    }

    // Ошибка дублирования уникального поля
    if (error.code === 11000) {
      next(new ConflictError('Товар с таким названием уже существует'));
      return;
    }

    next(error);
  }
};

// Получить товар по ID
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      throw new NotFoundError('Товар не найден');
    }

    res.status(200).json(product);
  } catch (error: any) {
    if (error.name === 'CastError') {
      next(new BadRequestError('Передан не валидный ID товара'));
      return;
    }
    next(error);
  }
};

// Псевдоним для совместимости с существующим кодом
export const getProducts = getAllProducts;

// Экспорт по умолчанию для удовлетворения правила ESLint
export default {
  getAllProducts,
  getProducts,
  createProduct,
  getProductById,
};
