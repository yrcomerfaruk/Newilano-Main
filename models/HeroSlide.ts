import mongoose, { Schema, type Model, type Types } from 'mongoose';

export type HeroSlideDocument = {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  mobileImage?: string;
  tabletImage?: string;
  desktopImage?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

const HeroSlideSchema = new Schema<HeroSlideDocument>(
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
    subtitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    ctaLabel: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60
    },
    ctaHref: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
    mobileImage: {
      type: String,
      trim: true
    },
    tabletImage: {
      type: String,
      trim: true
    },
    desktopImage: {
      type: String,
      trim: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const existingHeroModel =
  typeof mongoose.models === 'object' ? (mongoose.models.HeroSlide as Model<HeroSlideDocument> | undefined) : undefined;

export const HeroSlideModel = existingHeroModel ||
  mongoose.model<HeroSlideDocument>('HeroSlide', HeroSlideSchema);
