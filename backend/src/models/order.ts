import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    payment: 'online' | 'cash';
    email: string;
    phone: string;
    address: string;
    total: number;
    items: mongoose.Types.ObjectId[];
    orderId: string; // уникальный ID заказа для клиента
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema: Schema<IOrder> = new Schema({
  payment: {
    type: String,
    enum: ['online', 'cash'],
    required: [true, 'Способ оплаты обязателен'],
  },
  email: {
    type: String,
    required: [true, 'Email обязателен'],
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, 'Телефон обязателен'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Адрес обязателен'],
    trim: true,
  },
  total: {
    type: Number,
    required: [true, 'Общая сумма обязательна'],
    min: [0, 'Сумма не может быть отрицательной'],
  },
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'product',
    required: [true, 'Товары обязательны'],
  }],
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
}, {
  timestamps: true,
});

orderSchema.index({ email: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model<IOrder>('order', orderSchema);

export default Order;
