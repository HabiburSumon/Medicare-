import mongoose, { Document, Schema } from 'mongoose';

export interface IWebsiteContent extends Document {
  section: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  items?: Array<{
    icon?: string;
    title: string;
    description?: string;
    link?: string;
    image?: string;
    [key: string]: any;
  }>;
  settings?: {
    [key: string]: any;
  };
  updatedAt: Date;
}

const WebsiteContentSchema = new Schema<IWebsiteContent>({
  section: { type: String, required: true, unique: true, index: true },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  items: [{
    icon: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    link: { type: String, default: '' },
    image: { type: String, default: '' },
  }],
  settings: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export default mongoose.model<IWebsiteContent>('WebsiteContent', WebsiteContentSchema);