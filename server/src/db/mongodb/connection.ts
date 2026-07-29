import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

let isConnected = false;

export async function connectMongo() {
  if (isConnected) return;
  if (!MONGODB_URI) {
    console.log('MongoDB not configured (MONGODB_URI empty), skipping');
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (err) {
    console.warn('MongoDB connection failed:', (err as Error).message);
    console.warn('Server will continue without MongoDB');
  }
}

export function isMongoConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function closeMongo() {
  if (isConnected) await mongoose.disconnect();
}
