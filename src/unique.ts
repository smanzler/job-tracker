import { MongoClient } from "mongodb";
import { Job } from "./job";

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "jobNotifier";
const COLLECTION_NAME = "seenJobs";

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not set");
}

const client = new MongoClient(MONGO_URI);

export async function getUniqueJobs(jobs: Job[]): Promise<Job[]> {
  await client.connect();
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);

  const existingJobIds = await collection.distinct("id");
  const existingIdSet = new Set(existingJobIds);
  console.log(`Found ${existingIdSet.size} existing jobs`);

  const newJobs = jobs.filter((job) => !existingIdSet.has(job.id));

  console.log(`Found ${newJobs.length} new jobs`);

  if (newJobs.length > 0) {
    await collection.insertMany(newJobs);
  }

  await client.close();

  return newJobs;
}
