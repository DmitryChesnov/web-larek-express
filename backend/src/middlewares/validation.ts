import { celebrate, Joi, Segments } from 'celebrate';
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;
const objectIdValidator = Joi.string().custom((value, helpers) => {
  if (!ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId validation');

// Валидация для продуктов
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
      .min(10)
      .max(500)
      .required()
      .messages({
        'string.min': 'Минимальная длина поля "description" - 10',
        'string.max': 'Максимальная длина поля "description" - 500',
        'any.required': 'Поле "description" должно быть заполнено',
      }),
    price: Joi.number()
      .min(0)
      .required()
      .messages({
        'number.min': 'Цена не может быть отрицательной',
        'any.required': 'Поле "price" должно быть заполнено',
      }),
    category: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Минимальная длина поля "category" - 2',
        'string.max': 'Максимальная длина поля "category" - 50',
        'any.required': 'Поле "category" должно быть заполнено',
      }),
    image: Joi.string()
      .uri()
      .optional(),
  }),
});

export const validateProductUpdate = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: objectIdValidator.required(),
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string()
      .min(2)
      .max(30)
      .optional(),
    description: Joi.string()
      .min(10)
      .max(500)
      .optional(),
    price: Joi.number()
      .min(0)
      .optional(),
    category: Joi.string()
      .min(2)
      .max(50)
      .optional(),
    image: Joi.string()
      .uri()
      .optional(),
  }).min(1),
});

export const validateProductId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: objectIdValidator.required(),
  }),
});

// Валидация для заказов
export const validateOrderCreate = celebrate({
  [Segments.BODY]: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: objectIdValidator.required(),
          quantity: Joi.number()
            .min(1)
            .required()
            .messages({
              'number.min': 'Количество товара должно быть не менее 1',
              'any.required': 'Поле "quantity" обязательно для каждого товара',
            }),
        }),
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'Заказ должен содержать хотя бы один товар',
        'any.required': 'Поле "items" обязательно',
      }),
    customerName: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Минимальная длина имени - 2 символа',
        'string.max': 'Максимальная длина имени - 100 символов',
        'any.required': 'Имя клиента обязательно',
      }),
    customerEmail: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Неверный формат email',
        'any.required': 'Email клиента обязателен',
      }),
    shippingAddress: Joi.string()
      .min(10)
      .max(500)
      .required()
      .messages({
        'string.min': 'Адрес доставки должен содержать минимум 10 символов',
        'string.max': 'Максимальная длина адреса - 500 символов',
        'any.required': 'Адрес доставки обязателен',
      }),
  }),
});

export const validateOrderId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: objectIdValidator.required(),
  }),
});
