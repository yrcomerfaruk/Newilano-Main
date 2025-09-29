import mongoose, { Schema, type Model, type Types } from 'mongoose';

export type VisitEventDocument = {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  createdAt: Date;
};

const VisitEventSchema = new Schema<VisitEventDocument>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

VisitEventSchema.index({ createdAt: -1 });
VisitEventSchema.index({ product: 1, createdAt: -1 });

const existingVisitEventModel =
  typeof mongoose.models === 'object'
    ? (mongoose.models.VisitEvent as Model<VisitEventDocument> | undefined)
    : undefined;

export const VisitEvent = existingVisitEventModel ||
  mongoose.model<VisitEventDocument>('VisitEvent', VisitEventSchema);
