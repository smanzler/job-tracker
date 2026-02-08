import "dotenv/config";
import { getUniqueJobs } from "./unique";
import { notify } from "./notify";
import { getJobs } from "./hc";
import { getFits } from "./fit";
import { Job } from "./job";

async function main() {
  try {
    console.log("Starting job scraper...");

    const { jobs, errors } = await getJobs();
    console.log(`Found ${jobs.length} total jobs`);

    const uniqueJobs = await getUniqueJobs(jobs);
    console.log(`Found ${uniqueJobs.length} unique jobs`);

    let fittedJobs: Job[] = [];
    if (uniqueJobs.length > 0) {
      const fittedJobs = await getFits(uniqueJobs);
      console.log(`Found ${fittedJobs.length} fitted jobs`);
    }

    await notify(fittedJobs, errors);
    console.log("Job scraper completed successfully");
  } catch (error) {
    console.error("Fatal error in job scraper:", error);
    process.exit(1);
  }
}

main();
