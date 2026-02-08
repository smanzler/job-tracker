import "dotenv/config";
import { notify } from "./notify";
import { getJobs } from "./hc";
import { getNewJobs } from "./new";

async function main() {
  try {
    console.log("Starting job scraper...");

    const { jobs, errors } = await getJobs();
    console.log(`Found ${jobs.length} total jobs`);

    const newJobs = await getNewJobs(jobs);
    console.log(`Found ${newJobs.length} new jobs`);

    await notify(newJobs, errors);
    console.log("Job scraper completed successfully");
  } catch (error) {
    console.error("Fatal error in job scraper:", error);
    process.exit(1);
  }
}

main();
