import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicine extends Document {
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  price: number;
  discount?: number;
  description: string;
  image?: string;
  images?: string[];
  inStock: boolean;
  requiresPrescription: boolean;
  dosageForm: string;
  strength: string;
  packSize?: string;
  sideEffects?: string;
  warnings?: string;
  dosageInstructions?: string;
  storageInstructions?: string;
  indications?: string;
  rating?: number;
  numReviews?: number;
  soldCount?: number;
}

const medicineSchema = new Schema<IMedicine>(
  {
    name: { type: String, required: true, trim: true },
    genericName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    manufacturer: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    description: { type: String, trim: true, default: '' },
    image: { type: String },
    images: [{ type: String }],
    inStock: { type: Boolean, default: true },
    requiresPrescription: { type: Boolean, default: false },
    dosageForm: { type: String, trim: true, default: '' },
    strength: { type: String, trim: true, default: '' },
    packSize: { type: String, trim: true, default: '' },
    sideEffects: { type: String, trim: true, default: '' },
    warnings: { type: String, trim: true, default: '' },
    dosageInstructions: { type: String, trim: true, default: '' },
    storageInstructions: { type: String, trim: true, default: '' },
    indications: { type: String, trim: true, default: '' },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

medicineSchema.index({ name: 'text', genericName: 'text', category: 1 });

export default mongoose.model<IMedicine>('Medicine', medicineSchema);