import { isInteresting } from "./match";
import { notify } from "./notify";
import { scrapers } from "./scrape/index";
import "dotenv/config";

const scrapeJobs = async () => {
  for (const scraper of scrapers) {
    try {
      const jobs = await scraper.scrape();
      console.log("jobs", jobs);
      console.log(`${scraper.name}: ${jobs.length} jobs found`);
      const interestingJobs = jobs.filter((job) => isInteresting(job));
      console.log(
        `${scraper.name}: ${interestingJobs.length} interesting jobs found`,
      );
      for (const job of interestingJobs) {
        await notify(job);
      }
    } catch (error) {
      console.error(error);
    }
  }
};

scrapeJobs()
  .catch(console.error)
  .then(() => {
    console.log("Finished scraping");
  });
