import "dotenv/config";
import mongoose from "mongoose";

export async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;
    const dbName = "collabpad"

    if (!uri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(uri, dbName ? { dbName } : {});

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}