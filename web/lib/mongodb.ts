import { MongoClient } from "mongodb";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getMongoClient() {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(env.MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}
