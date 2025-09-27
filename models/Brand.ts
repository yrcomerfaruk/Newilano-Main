import mongoose, { Schema, type Model, type Types } from 'mongoose';

export type BrandDocument = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
};

const BrandSchema = new Schema<BrandDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 120
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 800
    },
    logo: {
      type: String,
      trim: true
    },
    categories: {
      type: [String],
      default: [],
      set: (values: string[]) => Array.from(new Set(values.map((value) => value.trim()))).filter(Boolean)
    }
  },
  { timestamps: true }
);

BrandSchema.index({ name: 'text', slug: 'text' });

const existingBrandModel =
  typeof mongoose.models === 'object' ? (mongoose.models.Brand as Model<BrandDocument> | undefined) : undefined;

export const Brand = existingBrandModel || mongoose.model<BrandDocument>('Brand', BrandSchema);
