import mongoose from "mongoose";
import "colors";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI not found in .env file");
    }
    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.log(error);
    console.log(`Error: ${(error as Error).message}`.red.bold);
  }
};
