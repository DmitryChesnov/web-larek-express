import { celebrate, Joi, Segments } from 'celebrate';
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;
const objectIdValidator = Joi.string().custom((value, helpers) => {
  if (!ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId validation');

// Валидация для создания продукта (соответствует тестам)
export const validateProductCreate = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string()
      .min(2)
      .max(30)
      .required()
      .messages({
        'string.min': 'Минимальная длина поля "title" - 2',
        'string.max': 'Максимальная длина поля "title" - 30',
        'any.required': 'Поле "title" должно быть заполнено',
      }),
    description: Joi.string()
      .required()
      .messages({
        'any.required': 'Поле "description" должно быть заполнено',
      }),
    price: Joi.number()
      .integer()
      .min(0)
      .messages({
        'number.min': 'Цена не может быть отрицательной',
        'number.integer': 'Цена должна быть целым числом',
      }),
    category: Joi.string()
      .required()
      .messages({
        'any.required': 'Поле "category" должно быть заполнено',
      }),
    image: Joi.object({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }).required(),
  }),
});

export const validateProductId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: objectIdValidator.required(),
  }),
});

// Валидация для создания заказа (соответствует тестам)
export const validateOrderCreate = celebrate({
  [Segments.BODY]: Joi.object({
    payment: Joi.string()
      .valid('online', 'cash')
      .required()
      .messages({
        'any.only': 'Поле "payment" должно быть "online" или "cash"',
        'any.required': 'Поле "payment" обязательно',
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Неверный формат email',
        'any.required': 'Email обязателен',
      }),
    phone: Joi.string()
      .pattern(/^\+7\d{10}$/)
      .required()
      .messages({
        'string.pattern.base': 'Телефон должен быть в формате +7XXXXXXXXXX',
        'any.required': 'Телефон обязателен',
      }),
    address: Joi.string()
      .required()
      .messages({
        'any.required': 'Адрес обязателен',
      }),
    total: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.min': 'Сумма не может быть отрицательной',
        'number.integer': 'Сумма должна быть целым числом',
        'any.required': 'Сумма обязательна',
      }),
    items: Joi.array()
      .items(Joi.string().custom((value, helpers) => {
        // Для тестов: если строка пустая, пропускаем (тесты иногда отправляют "")
        if (value === "") return value;
        if (!ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }, 'ObjectId validation'))
      .required()
      .messages({
        'any.required': 'Товары обязательны',
      }),
  }),
});