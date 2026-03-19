import "dotenv/config";
import { fetchBatches } from "./src/fetch-batches";
import { getCompletedBatchJobs } from "./src/status";
import { updateJobScores } from "./src/scores";

async function main() {
  const batchJobs = await fetchBatches();
  const completedBatchJobs = await getCompletedBatchJobs(batchJobs);

  await updateJobScores(completedBatchJobs);
}

main();
