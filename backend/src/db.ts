import mongoose from 'mongoose';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/reddit-clone';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // FIX: Cast process to 'any' to bypass TypeScript error. 'process.exit' is a valid Node.js function.
    (process as any).exit(1);
  }
};

export default connectDB;
