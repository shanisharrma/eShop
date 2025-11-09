import mongoose from "mongoose";

const globalForMongoose = globalThis as unknown as {
  globalForMongoose: Promise<typeof mongoose>;
  mongooseConn?: typeof mongoose;
};

export async function mongoConnect() {
  if (globalForMongoose.mongooseConn) return globalForMongoose.mongooseConn;

  const mongoURI = process.env.DATABASE_URL;
  if (!mongoURI) throw new Error("MongoDB connection Error!");

  const conn = await mongoose.connect(mongoURI, {
    maxPoolSize: 20,
    dbName: process.env.DATABASE_NAME,
  });

  globalForMongoose.mongooseConn = conn;
  console.log(`Connected to MongoDB (${conn.Connection.name})`);

  return conn;
}
