import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAppointment extends Document {
  patient: Types.ObjectId;
  doctor: Types.ObjectId;
  appointmentDate: Date;
  timeSlot: { start: string; end: string };
  serialNumber: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  type: 'video' | 'recorded-video';
  notes?: string;
  cancellationReason?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  meetingLink?: string;
  recordedVideoUrl?: string;
  doctorResponse?: string;
  responseDate?: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentDate: { type: Date, required: true },
    timeSlot: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    serialNumber: { type: String, unique: true, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
      default: 'pending',
    },
    type: {
      type: String,
      enum: ['video', 'recorded-video'],
      default: 'video',
    },
    notes: { type: String, trim: true },
    cancellationReason: { type: String, trim: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentId: { type: String },
    meetingLink: { type: String },
    recordedVideoUrl: { type: String },
    doctorResponse: { type: String, trim: true },
    responseDate: { type: Date },
  },
  { timestamps: true }
);

appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ serialNumber: 1 });

export default mongoose.model<IAppointment>('Appointment', appointmentSchema);