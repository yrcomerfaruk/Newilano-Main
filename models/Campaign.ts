import mongoose, { Schema, type Model, type Types } from 'mongoose';

export type CampaignDocument = {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  longDescription?: string; // detailed body shown on campaign page
  image: string;
  ctaLabel?: string;
  ctaHref?: string;
  productSlugs?: string[]; // associated products by slug
  productIds?: Types.ObjectId[]; // associated products by id
  endDate?: Date; // campaign end date (optional)
  createdAt: Date;
  updatedAt: Date;
};

const CampaignSchema = new Schema<CampaignDocument>(
  {
    title: {
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
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 400
    },
    longDescription: {
      type: String,
      trim: true,
      maxlength: 4000,
      default: ''
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
    ctaLabel: {
      type: String,
      trim: true,
      default: 'Detay'
    },
    ctaHref: {
      type: String,
      trim: true,
      default: '/kampanyalar'
    },
    productSlugs: {
      type: [String],
      default: []
    },
    productIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Product',
      default: []
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const existingCampaignModel =
  typeof mongoose.models === 'object' ? (mongoose.models.Campaign as Model<CampaignDocument> | undefined) : undefined;

export const CampaignModel = existingCampaignModel ||
  mongoose.model<CampaignDocument>('Campaign', CampaignSchema);
