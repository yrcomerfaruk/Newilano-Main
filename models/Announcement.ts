import mongoose, { Schema, type Model, type Types } from 'mongoose';

export type AnnouncementDocument = {
  _id: Types.ObjectId;
  message: string;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

const AnnouncementSchema = new Schema<AnnouncementDocument>(
  {
    message: { type: String, required: true, trim: true, maxlength: 280 },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const existingModel =
  typeof mongoose.models === 'object' ? (mongoose.models.Announcement as Model<AnnouncementDocument> | undefined) : undefined;

export const AnnouncementModel: Model<AnnouncementDocument> = existingModel ?? mongoose.model<AnnouncementDocument>('Announcement', AnnouncementSchema);
