import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  appointment?: Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'video';
  fileUrl?: string;
  isRead: boolean;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    content: { type: String, trim: true },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'video'],
      default: 'text',
    },
    fileUrl: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ appointment: 1 });

export default mongoose.model<IMessage>('Message', messageSchema);