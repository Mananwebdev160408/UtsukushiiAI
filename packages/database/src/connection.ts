import mongoose from "mongoose";


export const connectDB = async (uri: string) => {
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};
