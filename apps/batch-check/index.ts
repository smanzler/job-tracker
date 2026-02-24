import "dotenv/config";
import { fetchBatches } from "./fetch-batches";
import { getCompletedBatchJobs } from "./status";
import { updateJobScores } from "./scores";

async function main() {
  const batchJobs = await fetchBatches();
  const completedBatchJobs = await getCompletedBatchJobs(batchJobs);

  await updateJobScores(completedBatchJobs);
}

main();
