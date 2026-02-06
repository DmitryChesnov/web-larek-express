import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  image?: string;
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
    required: [true, 'Поле "price" должно быть заполнено'],
    min: [0, 'Цена не может быть отрицательной'],
  },
  category: {
    type: String,
    required: [true, 'Поле "category" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "category" - 2'],
    maxlength: [50, 'Максимальная длина поля "category" - 50'],
    trim: true,
  },
  image: {
    type: String,
    default: '',
    validate: {
      validator(v: string) {
        return v === '' || /^(https?:\/\/)/.test(v);
      },
      message: 'Неверный формат URL изображения',
    },
  },
}, {
  timestamps: true,
});

// Индексы для оптимизации запросов
ProductSchema.index({ title: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
