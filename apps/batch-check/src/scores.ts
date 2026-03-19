import { ObjectId } from "mongodb";
import { z } from "zod";
import { ai } from "./ai";
import { client } from "./mongo";
import { Response } from "./status";

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
});

const DB_NAME = "jobNotifier";
const COLLECTION_NAME = "seenJobs";
const BATCH_COLLECTION_NAME = "fitBatchJobs";

export async function updateJobScores(
  completedBatchJobs: { batchJobName: string; responses: Response[] }[],
) {
  try {
    await client.connect();
    const jobsCollection = client.db(DB_NAME).collection(COLLECTION_NAME);
    const batchCollection = client
      .db(DB_NAME)
      .collection(BATCH_COLLECTION_NAME);

    const successfulBatchJobs = new Set<string>();

    for (const completedBatchJob of completedBatchJobs) {
      for (const response of completedBatchJob.responses) {
        await jobsCollection.updateOne(
          { id: response.job_id },
          { $set: { fit_score: response.score } },
        );
        console.log(
          `Updated job ${response.job_id} with score ${response.score}`,
        );
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
