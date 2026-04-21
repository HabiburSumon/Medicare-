import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  patient: Types.ObjectId;
  doctor: Types.ObjectId;
  appointment: Types.ObjectId;
  rating: number;
  comment: string;
  isApproved: boolean;
}

const reviewSchema = new Schema<IReview>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reviewSchema.index({ doctor: 1 });
reviewSchema.index({ patient: 1, appointment: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', reviewSchema);