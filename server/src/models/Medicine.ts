import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicine extends Document {
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  price: number;
  description: string;
  image?: string;
  inStock: boolean;
  requiresPrescription: boolean;
  dosageForm: string;
  strength: string;
}

const medicineSchema = new Schema<IMedicine>(
  {
    name: { type: String, required: true, trim: true },
    genericName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    manufacturer: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    image: { type: String },
    inStock: { type: Boolean, default: true },
    requiresPrescription: { type: Boolean, default: false },
    dosageForm: { type: String, trim: true },
    strength: { type: String, trim: true },
  },
  { timestamps: true }
);

medicineSchema.index({ name: 'text', genericName: 'text', category: 1 });

export default mongoose.model<IMedicine>('Medicine', medicineSchema);