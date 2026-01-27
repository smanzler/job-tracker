import { chromium } from "playwright";
import { Job } from "./job";
import { z } from "zod";

const jobSchema = z.object({
  id: z.string(),
  apply_url: z.string(),
  job_information: z.object({
    title: z.string(),
  }),
  v5_processed_job_data: z.object({
    core_job_title: z.string(),
    requirements_summary: z.string(),
    technical_tools: z.array(z.string()),
    seniority_level: z.string(),
    job_category: z.string(),
    commitment: z.array(z.string()),
    workplace_type: z.string(),
    formatted_workplace_location: z.string(),
    yearly_min_compensation: z.union([z.number(), z.null()]),
    yearly_max_compensation: z.union([z.number(), z.null()]),
    company_name: z.union([z.null(), z.string()]),
    company_website: z.union([z.null(), z.string()]),
    estimated_publish_date: z.coerce.date(),
  }),
});

export async function getJobsFromHiringCafe(): Promise<Job[]> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto(
      "https://hiring.cafe/?searchState=%7B%22defaultToUserLocation%22%3Afalse%2C%22seniorityLevel%22%3A%5B%22No%20Prior%20Experience%20Required%22%2C%22Entry%20Level%22%5D%2C%22sortBy%22%3A%22date%22%2C%22technologyKeywordsQuery%22%3A%22TypeScript%22%7D",
    );
    const response = await page.waitForResponse((res) => {
      return res.url().includes("/api/search-jobs?s=") && res.status() === 200;
    });

    if (!response || !response.ok()) {
      throw new Error("No response from Hiring Cafe");
    }

    const { results } = (await response.json()) as { results: any[] };

    const jobs = results.map((result) => jobSchema.parse(result));

    const mappedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.job_information.title,
      company: job.v5_processed_job_data.company_name ?? "Unknown",
      url: job.apply_url,
      job_description: job.v5_processed_job_data.requirements_summary,
      department: job.v5_processed_job_data.job_category,
    }));

    return mappedJobs;
  } catch (error) {
    console.error(error);
    return [];
  } finally {
    await browser.close();
  }
}
