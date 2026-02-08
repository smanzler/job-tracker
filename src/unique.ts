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
  try {
    await client.connect();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);

    const existingJobIds = await collection.distinct("id");
    const existingIdSet = new Set(existingJobIds);
    console.log(`Found ${existingIdSet.size} existing jobs in database`);

    const newJobs = jobs.filter((job) => !existingIdSet.has(job.id));
    console.log(`Identified ${newJobs.length} new jobs`);

    if (newJobs.length > 0) {
      await collection.insertMany(newJobs);
      console.log(`Inserted ${newJobs.length} new jobs into database`);
    }

    // clean up jobs that are archived and are over 7 days old
    const deletedJobs = await collection.deleteMany({
      archived: true,
      posted_at: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    console.log(`Cleaned up ${deletedJobs.deletedCount} archived jobs`);

    return newJobs;
  } catch (error) {
    console.error("Error filtering unique jobs:", error);
    throw new Error(
      `Failed to process unique jobs: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  } finally {
    await client.close();
  }
}
