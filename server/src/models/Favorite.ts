import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFavorite extends Document {
  patient: Types.ObjectId;
  doctor: Types.ObjectId;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ patient: 1, doctor: 1 }, { unique: true });

export default mongoose.model<IFavorite>('Favorite', favoriteSchema);