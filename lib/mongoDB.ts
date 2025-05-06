import mongoose, { ConnectOptions } from "mongoose";

let isConnected: boolean = false;

export const connectToDB = async (): Promise<void> => {
  if (!process.env.MONGODB_URL) {
    throw new Error("MongoDB URL is not defined in environment variables");
  }

  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    const options: ConnectOptions = {
      dbName: "library",
      retryWrites: true,
      w: "majority", // Fix: đúng kiểu của W
    };

    await mongoose.connect(process.env.MONGODB_URL, options);
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (err) {
    isConnected = false;
    console.error("MongoDB connection error:", err);
    throw new Error("Failed to connect to MongoDB");
  }
};
