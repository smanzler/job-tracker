import { chromium } from "playwright";
import { Job } from "./job";
import { z } from "zod";
import type { Response } from "playwright";

const urls = [
  "https://hiring.cafe/?searchState=%7B%22defaultToUserLocation%22%3Afalse%2C%22seniorityLevel%22%3A%5B%22No%20Prior%20Experience%20Required%22%2C%22Entry%20Level%22%5D%2C%22sortBy%22%3A%22date%22%2C%22technologyKeywordsQuery%22%3A%22TypeScript%22%7D",
];

const jobSchema = z.object({
  id: z.string(),
  apply_url: z.string(),
  job_information: z.object({
    title: z.string(),
    description: z.string(),
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
    estimated_publish_date: z.coerce.date(),
    min_industry_and_role_yoe: z.union([z.number(), z.null()]),
  }),
  v5_processed_company_data: z.object({
    name: z.string(),
    website: z.string().nullable(),
    image_url: z.string().nullable(),
  }),
});

async function getJobsFromHiringCafe(url: string): Promise<Job[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const [response] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/search-jobs?s=") && res.status() === 200,
      ),
      page.goto(url, { waitUntil: "networkidle" }),
    ]);

    if (!response || !response.ok()) {
      throw new Error("No response from Hiring Cafe");
    }

    const { results } = (await response.json()) as { results: any[] };

    const jobs = results.map((result) => jobSchema.parse(result));

    const mappedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.job_information.title,
      company: job.v5_processed_company_data.name ?? "Unknown",
      company_url: job.v5_processed_company_data.website ?? undefined,
      company_logo: job.v5_processed_company_data.image_url ?? undefined,
      min_industry_and_role_yoe:
        job.v5_processed_job_data.min_industry_and_role_yoe,
      technical_tools: job.v5_processed_job_data.technical_tools,
      url: job.apply_url,
      summary: job.v5_processed_job_data.requirements_summary,
      job_description: job.job_information.description,
      department: job.v5_processed_job_data.job_category,
      posted_at: job.v5_processed_job_data.estimated_publish_date,
    }));

    return mappedJobs;
  } catch (error) {
    console.error(error);
    return [];
  } finally {
    await browser.close();
  }
}

export async function getJobs(): Promise<Job[]> {
  const jobsMap = new Map<string, Job>();
  for (const url of urls) {
    const newJobs = await getJobsFromHiringCafe(url);
    console.log(
      `Found ${newJobs.length} jobs from ${url.slice(0, 20)}${url.length > 20 ? "..." : ""}`,
    );
    for (const job of newJobs) {
      if (!jobsMap.has(job.id)) {
        jobsMap.set(job.id, job);
      }
    }
  }
  return Array.from(jobsMap.values());
}
