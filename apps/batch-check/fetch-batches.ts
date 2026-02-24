import { MongoClient, ObjectId } from "mongodb";
import { z } from "zod";

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "jobNotifier";
const BATCH_COLLECTION_NAME = "fitBatchJobs";

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not set");
}

const client = new MongoClient(MONGO_URI);

const batchJobSchema = z.object({
  _id: z.instanceof(ObjectId),
  name: z.string(),
  created_at: z.date(),
  status: z.string(),
});

export type BatchJob = z.infer<typeof batchJobSchema>;

export async function fetchBatches(): Promise<BatchJob[]> {
  try {
    await client.connect();
    const collection = client.db(DB_NAME).collection(BATCH_COLLECTION_NAME);
    const batches = await collection.find({ status: "pending" }).toArray();

    console.log(`Found ${batches.length} pending batch jobs`);

    return batches.map((batch) => batchJobSchema.parse(batch));
  } catch (error) {
    console.error("Error fetching batches:", error);
    throw new Error(`Failed to fetch batches: ${error}`);
  } finally {
    await client.close();
  }
}
