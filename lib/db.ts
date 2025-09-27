import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/newilano';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

type GlobalWithMongoose = typeof globalThis & { mongoose: MongooseCache };
const globalWithMongoose = global as GlobalWithMongoose;
// Initialize global cache if it doesn't exist
globalWithMongoose.mongoose = globalWithMongoose.mongoose || { conn: null, promise: null };
const cached: MongooseCache = globalWithMongoose.mongoose;

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
