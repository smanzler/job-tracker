import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;
export const DB_NAME = "jobNotifier";
export const COLLECTION_NAME = "seenJobs";

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not set");
}

let client: MongoClient;

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClient: MongoClient;
  };

  if (!globalWithMongo._mongoClient) {
    console.log("creating new mongo client");
    globalWithMongo._mongoClient = new MongoClient(MONGO_URI);
  } else {
    console.log("using existing mongo client");
  }

  client = globalWithMongo._mongoClient;
} else {
  client = new MongoClient(MONGO_URI);
}

export default client;
