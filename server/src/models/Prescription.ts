import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPrescription extends Document {
  appointment: Types.ObjectId;
  patient: Types.ObjectId;
  doctor: Types.ObjectId;
  diagnosis: string;
  symptoms: string[];
  medicines: {
    name: string;
    dosage: string;
    duration: string;
    instructions: string;
  }[];
  tests?: string[];
  testResults?: {
    testName: string;
    fileUrl: string;
    fileName: string;
    uploadedAt: Date;
  }[];
  notes?: string;
  followUpDate?: Date;
}

const prescriptionSchema = new Schema<IPrescription>(
  {
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    diagnosis: { type: String, required: true, trim: true },
    symptoms: [{ type: String, trim: true }],
    medicines: [{
      name: { type: String, required: true, trim: true },
      dosage: { type: String, required: true, trim: true },
      duration: { type: String, required: true, trim: true },
      instructions: { type: String, trim: true },
    }],
    tests: [{ type: String, trim: true }],
    testResults: [{
      testName: { type: String, required: true, trim: true },
      fileUrl: { type: String, required: true },
      fileName: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    }],
    notes: { type: String, trim: true },
    followUpDate: { type: Date },
  },
  { timestamps: true }
);

prescriptionSchema.index({ patient: 1 });
prescriptionSchema.index({ doctor: 1 });

export default mongoose.model<IPrescription>('Prescription', prescriptionSchema);