import "dotenv/config";
import { getUniqueJobs } from "./unique";
import { isInteresting } from "./match";
import { notify } from "./notify";
import { getJobs } from "./hc";

async function main() {
  const jobs = await getJobs();
  console.log(`Found ${jobs.length} jobs`);

  // const interestingJobs = jobs.filter((job) => isInteresting(job));
  // console.log(`Found ${interestingJobs.length} interesting jobs`);

  const uniqueJobs = await getUniqueJobs(jobs);
  console.log(`Found ${uniqueJobs.length} unique jobs`);

  for (const job of uniqueJobs) {
    await notify(job);
  }
}

main().catch(console.error);
