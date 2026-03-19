import { MongoClient } from "mongodb";
import { Job } from "./job";
import { generateFits } from "./fit";

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "jobNotifier";
const COLLECTION_NAME = "seenJobs";
const BATCH_COLLECTION_NAME = "fitBatchJobs";

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not set");
}

const client = new MongoClient(MONGO_URI);

export async function getNewJobs(jobs: Job[]): Promise<Job[]> {
  try {
    await client.connect();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);
    const batchCollection = client
      .db(DB_NAME)
      .collection(BATCH_COLLECTION_NAME);

    const existingJobIds = await collection.distinct("id");
    const existingIdSet = new Set(existingJobIds);
    console.log(`Found ${existingIdSet.size} existing jobs in database`);

    const newJobs = jobs.filter((job) => !existingIdSet.has(job.id));
    console.log(`Found ${newJobs.length} new jobs`);

    if (newJobs.length === 0) return [];

    const batchJobName = await generateFits(newJobs);

    await batchCollection.insertOne({
      name: batchJobName,
      created_at: new Date(),
      status: "pending",
    });

    console.log(`Inserted batch job ${batchJobName} into database`);

    await collection.insertMany(newJobs);
    console.log(`Inserted ${newJobs.length} jobs into database`);

    // clean up jobs that are archived and are over 7 days old
    const deletedJobs = await collection.deleteMany({
      archived: true,
      posted_at: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    console.log(`Cleaned up ${deletedJobs.deletedCount} archived jobs`);

    return newJobs;
  } catch (error) {
    console.error("Error filtering new jobs:", error);
    throw new Error(
      `Failed to process new jobs: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  } finally {
    await client.close();
  }
}
