import { chromium } from "playwright";
import { Job } from "../job";
import { z } from "zod";

const jobSchema = z.object({
  jobId: z.string(),
  title: z.string(),
  applyUrl: z.string(),
  cityState: z.string(),
  postedDate: z.string(),
});

export const scrapeUsBank = async (): Promise<Job[]> => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(
      "https://careers.usbank.com/global/en/search-results?keywords=software&s=1",
      { waitUntil: "networkidle" },
    );

    const jobs: any[] = await page.evaluate(() => {
      // @ts-ignore
      return window.phApp?.ddo?.eagerLoadRefineSearch?.data?.jobs || [];
    });

    const validatedJobs = jobs.map((job) => jobSchema.parse(job));

    return validatedJobs.map((job) => ({
      id: job.jobId,
      title: job.title,
      url: job.applyUrl,
      company: "US Bank",
      location: job.cityState,
      posted_at: new Date(job.postedDate).toLocaleDateString(),
    }));
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await browser.close();
  }
};
