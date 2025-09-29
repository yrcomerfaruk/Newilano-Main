import mongoose, { Schema, type Model, type Types } from 'mongoose';

export type FavoriteEventDocument = {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  product: Types.ObjectId;
  createdAt: Date;
};

const FavoriteEventSchema = new Schema<FavoriteEventDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
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

FavoriteEventSchema.index({ createdAt: -1 });
FavoriteEventSchema.index({ product: 1, createdAt: -1 });
FavoriteEventSchema.index({ user: 1, product: 1 }, { unique: true });

const existingFavoriteEventModel =
  typeof mongoose.models === 'object'
    ? (mongoose.models.FavoriteEvent as Model<FavoriteEventDocument> | undefined)
    : undefined;

export const FavoriteEvent = existingFavoriteEventModel ||
  mongoose.model<FavoriteEventDocument>('FavoriteEvent', FavoriteEventSchema);
