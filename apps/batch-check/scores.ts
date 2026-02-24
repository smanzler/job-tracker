import { ObjectId } from "mongodb";
import { z } from "zod";
import { ai } from "./ai";
import { client } from "./mongo";

export const jobSchema = z.object({
  _id: z.instanceof(ObjectId),
  id: z.string(),
  title: z.string(),
  company: z.string().nullable(),
  company_url: z.string().nullable(),
  company_logo: z.string().nullable(),
  min_industry_and_role_yoe: z.number().nullable(),
  technical_tools: z.array(z.string()).optional(),
  url: z.string(),
  summary: z.string(),
  job_description: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  salary_min: z.number().nullable(),
  salary_max: z.number().nullable(),
  workplace_type: z.string().optional(),
  commitment: z.array(z.string()).optional(),
  posted_at: z.coerce.date(),
  search_state: z.string(),
  fit_score: z.number().nullable(),
  batch_job: z
    .object({
      name: z.string(),
      index: z.number(),
    })
    .optional(),
});

const DB_NAME = "jobNotifier";
const COLLECTION_NAME = "seenJobs";
const BATCH_COLLECTION_NAME = "fitBatchJobs";

export async function updateJobScores(
  completedBatchJobs: { batchJobName: string; scores: number[] }[],
) {
  try {
    await client.connect();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);
    const batchCollection = client
      .db(DB_NAME)
      .collection(BATCH_COLLECTION_NAME);

    const successfulBatchJobs = new Set<string>();

    for (const completedBatchJob of completedBatchJobs) {
      const jobs = await collection
        .find({ "batch_job.name": completedBatchJob.batchJobName })
        .sort({ "batch_job.index": 1 })
        .toArray();

      const parsedJobs = jobs.map((job) => jobSchema.parse(job));

      console.log(
        `Updating ${parsedJobs.length} jobs for batch ${completedBatchJob.batchJobName}`,
      );

      for (let i = 0; i < parsedJobs.length; i++) {
        const job = parsedJobs[i];
        const score = completedBatchJob.scores[i];

        if (score !== undefined) {
          await collection.updateOne(
            { _id: job._id },
            { $set: { fit_score: score } },
          );
          console.log(`Updated job ${job.id} (index ${i}) with score ${score}`);
        } else {
          console.warn(`No score found for job ${job.id} at index ${i}`);
        }
      }

      successfulBatchJobs.add(completedBatchJob.batchJobName);
    }

    await batchCollection.deleteMany({
      name: { $in: Array.from(successfulBatchJobs) },
    });

    for (const batchJobName of successfulBatchJobs) {
      await ai.batches.delete({
        name: batchJobName,
      });
      console.log(`Deleted batch ${batchJobName}`);
    }
  } catch (error) {
    console.error("Error updating job scores:", error);
    throw new Error(`Failed to update job scores: ${error}`);
  } finally {
    await client.close();
  }
}
