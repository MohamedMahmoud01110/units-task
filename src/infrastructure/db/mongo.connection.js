import mongoose from "mongoose";

export const connectMongo = async (uri) => {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  return mongoose.connection;
};

export const isMongoUp = () => mongoose.connection.readyState === 1;

export const disconnectMongo = () => mongoose.disconnect();
