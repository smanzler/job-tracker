import { scrapers } from "./scrape/index";

const scrapeJobs = async () => {
  scrapers.forEach(async (scraper) => {
    try {
      const jobs = await scraper.scrape();
      console.log(`${scraper.name}: ${jobs.length} jobs found`);
    } catch (error) {
      console.error(error);
    }
  });
};

scrapeJobs().catch(console.error);
