import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = process.env.MONGO_URL as string;

const ConnectDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("-->Mongo connect successfully.");
  } catch (error) {
    console.log(`Err connect mongo: ` + error);
  }
};

export default ConnectDB;
