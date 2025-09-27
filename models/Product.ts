import mongoose, { Schema, type Model, type Types } from 'mongoose';

export type ProductDocument = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  brand: Types.ObjectId;
  brandName: string;
  category: string;
  price: number;
  currency: string;
  image: string;
  gender?: 'ERKEK' | 'KADIN' | 'UNISEX';
  tags?: ('HYPE' | 'ONE_CIKAN' | 'YENI' | 'INDIRIMDE')[];
  description: string;
  productUrl?: string;
  gallery: string[];
  sizes: string[];
  colors: string[];
  features: string[];
  createdAt: Date;
  updatedAt: Date;
};

const ProductSchema = new Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
      required: true
    },
    brandName: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'TRY',
      uppercase: true
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
    gender: {
      type: String,
      enum: ['ERKEK', 'KADIN', 'UNISEX']
    },
    tags: {
      type: [String],
      enum: ['HYPE', 'ONE_CIKAN', 'YENI', 'INDIRIMDE'],
      default: []
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200
    },
    productUrl: {
      type: String,
      trim: true,
      maxlength: 300
    },
    gallery: {
      type: [String],
      default: [],
      set: (values: string[]) => Array.from(new Set(values)).filter(Boolean)
    },
    sizes: {
      type: [String],
      default: [],
      set: (values: string[]) => Array.from(new Set(values)).filter(Boolean)
    },
    colors: {
      type: [String],
      default: [],
      set: (values: string[]) => Array.from(new Set(values)).filter(Boolean)
    },
    features: {
      type: [String],
      default: [],
      set: (values: string[]) => Array.from(new Set(values)).filter(Boolean)
    }
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', brandName: 'text', category: 'text' });
ProductSchema.index({ createdAt: -1 });

const existingProductModel =
  typeof mongoose.models === 'object' ? (mongoose.models.Product as Model<ProductDocument> | undefined) : undefined;

export const Product = existingProductModel || mongoose.model<ProductDocument>('Product', ProductSchema);
