import mongoose, { Schema, Document } from 'mongoose';

// Интерфейс для объекта image
interface IProductImage {
  fileName: string;
  originalName: string;
}

// Схема для изображения
const ProductImageSchema: Schema = new Schema({
  fileName: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
}, { _id: false });

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number | null;
  category: string;
  image: IProductImage;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  title: {
    type: String,
    unique: true,
    required: [true, 'Поле "title" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "title" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Поле "description" должно быть заполнено'],
    minlength: [10, 'Минимальная длина поля "description" - 10'],
    maxlength: [500, 'Максимальная длина поля "description" - 500'],
    trim: true,
  },
  price: {
    type: Number,
    min: [0, 'Цена не может быть отрицательной'],
    default: null,
  },
  category: {
    type: String,
    required: [true, 'Поле "category" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "category" - 2'],
    maxlength: [50, 'Максимальная длина поля "category" - 50'],
    trim: true,
  },
  image: {
    type: ProductImageSchema,
    required: [true, 'Изображение обязательно'],
  },
}, {
  timestamps: true,
});

// Индексы для оптимизации запросов
ProductSchema.index({ title: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
