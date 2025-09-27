import mongoose, { Schema, type Model } from 'mongoose';

export type UserDocument = {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  favorites: string[];
  createdAt: Date;
  updatedAt: Date;
};

const UserSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /.+\@.+\..+/
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    favorites: {
      type: [String],
      default: [],
      set: (values: string[]) => Array.from(new Set(values))
    }
  },
  { timestamps: true }
);

const existingUserModel =
  typeof mongoose.models === 'object' ? (mongoose.models.User as Model<UserDocument> | undefined) : undefined;

export const User = existingUserModel || mongoose.model<UserDocument>('User', UserSchema);
