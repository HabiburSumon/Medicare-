import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrderItem {
  medicine: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  patient: Types.ObjectId;
  prescription?: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponCode?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  shippingAddress: string;
  phone: string;
}

const orderItemSchema = new Schema<IOrderItem>({
  medicine: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
});

const orderSchema = new Schema<IOrder>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    prescription: { type: Schema.Types.ObjectId, ref: 'Prescription' },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    couponCode: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: { type: String },
    shippingAddress: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

orderSchema.index({ patient: 1 });

export default mongoose.model<IOrder>('Order', orderSchema);