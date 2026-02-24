import { ai } from "./ai";
import type { BatchJob } from "./fetch-batches";

const completedStates = new Set([
  "JOB_STATE_SUCCEEDED",
  "JOB_STATE_FAILED",
  "JOB_STATE_CANCELLED",
  "JOB_STATE_EXPIRED",
]);

export async function getCompletedBatchJobs(
  batchJobs: BatchJob[],
): Promise<{ batchJobName: string; scores: number[] }[]> {
  const completedBatchJobs: { batchJobName: string; scores: number[] }[] = [];

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

      const scores: number[] = [];

      if (inlineBatchJob.dest?.inlinedResponses) {
        for (let i = 0; i < inlineBatchJob.dest.inlinedResponses.length; i++) {
          const inlineResponse = inlineBatchJob.dest.inlinedResponses[i];
          let score;

          if (inlineResponse.error) {
            console.error(`Error: ${inlineResponse.error}`);
            continue;
          }

          if (!inlineResponse.response) {
            console.error(`Response is undefined`);
            continue;
          }

          inlineResponse.response.responseId;

          if (inlineResponse.response.text !== undefined) {
            score = inlineResponse.response.text;
          } else {
            score =
              inlineResponse.response.candidates?.[0]?.content?.parts?.[0]
                ?.text;
          }

          if (score === undefined || isNaN(Number(score))) {
            console.error(`Score is undefined`);
            continue;
          }

          scores.push(Number(score));
        }
      }

      completedBatchJobs.push({
        batchJobName: mongoBatchJob.name,
        scores,
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
