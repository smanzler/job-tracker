import "dotenv/config";
import { getUniqueJobs } from "./unique";
import { isInteresting } from "./match";
import { notify } from "./notify";
import { getJobsFromHiringCafe } from "./hc";

async function main() {
  const jobs = await getJobsFromHiringCafe();
  console.log(`Found ${jobs.length} jobs`);

  const uniqueJobs = await getUniqueJobs(jobs);
  console.log(`Found ${uniqueJobs.length} unique jobs`);

  const interestingJobs = uniqueJobs.filter((job) => isInteresting(job));
  console.log(`Found ${interestingJobs.length} interesting jobs`);

  for (const job of interestingJobs) {
    await notify(job);
  }
}

main().catch(console.error);
