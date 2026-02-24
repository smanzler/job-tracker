import { ai } from "./ai";
import type { BatchJob } from "./fetch-batches";
import { z } from "zod";

const completedStates = new Set([
  "JOB_STATE_SUCCEEDED",
  "JOB_STATE_FAILED",
  "JOB_STATE_CANCELLED",
  "JOB_STATE_EXPIRED",
]);

const responseSchema = z.object({
  job_id: z.string(),
  score: z.number(),
});

export type Response = z.infer<typeof responseSchema>;

export async function getCompletedBatchJobs(
  batchJobs: BatchJob[],
): Promise<{ batchJobName: string; responses: Response[] }[]> {
  const completedBatchJobs: { batchJobName: string; responses: Response[] }[] =
    [];

  for (const mongoBatchJob of batchJobs) {
    try {
      const inlineBatchJob = await ai.batches.get({
        name: mongoBatchJob.name,
      });

      if (!inlineBatchJob.state) {
        throw new Error("Batch job state is undefined");
      }

      if (!completedStates.has(inlineBatchJob.state)) {
        console.log(`Batch job ${mongoBatchJob.name} is not completed`);
        continue;
      }

      console.log(JSON.stringify(inlineBatchJob, null, 2));

      const responses: Response[] = [];

      if (inlineBatchJob.dest?.inlinedResponses) {
        for (const inlineResponse of inlineBatchJob.dest.inlinedResponses) {
          if (!inlineResponse.response) {
            console.error(`Response is undefined`);
            continue;
          }

          inlineResponse.response.responseId;

          const responseAsText =
            inlineResponse.response.candidates?.[0]?.content?.parts?.[0]?.text;

          if (!responseAsText) {
            console.error(`Response is undefined`);
            continue;
          }

          const responseAsJson = responseSchema.parse(
            JSON.parse(responseAsText),
          );

          console.log(JSON.stringify(responseAsJson, null, 2));

          responses.push(responseAsJson);
        }
      }

      completedBatchJobs.push({
        batchJobName: mongoBatchJob.name,
        responses,
      });
    } catch (error) {
      console.error(
        `An error occurred while polling job ${mongoBatchJob.name}:`,
        error,
      );
    }
  }

  return completedBatchJobs;
}
