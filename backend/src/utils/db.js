import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MongoDB Atlas URI is not defined in environment variables");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Atlas Connected Successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
