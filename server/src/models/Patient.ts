import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPatient extends Document {
  user: Types.ObjectId;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address?: string;
  medicalHistory?: string;
  allergies?: string[];
  emergencyContact?: string;
}

const patientSchema = new Schema<IPatient>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    address: { type: String, trim: true },
    medicalHistory: { type: String, trim: true },
    allergies: [{ type: String }],
    emergencyContact: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPatient>('Patient', patientSchema);