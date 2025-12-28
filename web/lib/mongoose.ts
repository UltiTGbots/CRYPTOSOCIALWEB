import mongoose from "mongoose";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | null | undefined;
}

export async function dbConnect() {
  if (global._mongooseConn) return global._mongooseConn;
  mongoose.set("strictQuery", true);
  const conn = await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB });
  global._mongooseConn = conn;
  return conn;
}
