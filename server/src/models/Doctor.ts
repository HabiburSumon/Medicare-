import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDoctor extends Document {
  user: Types.ObjectId;
  specialization: string;
  experience: number;
  qualification: string;
  bio: string;
  consultationFee: number;
  rating: number;
  totalReviews: number;
  availableDays: string[];
  timeSlots: { start: string; end: string }[];
  isAvailable: boolean;
  languages: string[];
  clinicAddress?: string;
  documents: string[];
}

const doctorSchema = new Schema<IDoctor>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    specialization: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, default: 0 },
    qualification: { type: String, required: true, trim: true },
    bio: { type: String, trim: true, maxlength: 1000 },
    consultationFee: { type: Number, required: true, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    availableDays: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
    timeSlots: [{
      start: { type: String, required: true },
      end: { type: String, required: true },
    }],
    isAvailable: { type: Boolean, default: true },
    languages: [{ type: String }],
    clinicAddress: { type: String, trim: true },
    documents: [{ type: String }],
  },
  { timestamps: true }
);

doctorSchema.index({ specialization: 1 });
doctorSchema.index({ rating: -1 });

export default mongoose.model<IDoctor>('Doctor', doctorSchema);