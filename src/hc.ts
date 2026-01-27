import { Browser, chromium } from "playwright";
import { Job } from "./job";
import { z } from "zod";

type SearchState = {
  name: string;
  url: string;
};

const searchStates: SearchState[] = [
  {
    name: "TypeScript",
    url: "https://hiring.cafe/?searchState=%7B%22defaultToUserLocation%22%3Afalse%2C%22seniorityLevel%22%3A%5B%22No+Prior+Experience+Required%22%2C%22Entry+Level%22%5D%2C%22sortBy%22%3A%22date%22%2C%22technologyKeywordsQuery%22%3A%22TypeScript%22%2C%22dateFetchedPastNDays%22%3A4%2C%22roleYoeRange%22%3A%5B0%2C0%5D%7D",
  },
  {
    name: "Early Career",
    url: "https://hiring.cafe/?searchState=%7B%22defaultToUserLocation%22%3Afalse%2C%22seniorityLevel%22%3A%5B%22No+Prior+Experience+Required%22%2C%22Entry+Level%22%5D%2C%22sortBy%22%3A%22date%22%2C%22jobTitleQuery%22%3A%22software%22%2C%22searchQuery%22%3A%22early+career%22%2C%22dateFetchedPastNDays%22%3A4%7D",
  },
  {
    name: "New Grad",
    url: "https://hiring.cafe/?searchState=%7B%22defaultToUserLocation%22%3Afalse%2C%22seniorityLevel%22%3A%5B%22No+Prior+Experience+Required%22%2C%22Entry+Level%22%5D%2C%22sortBy%22%3A%22date%22%2C%22jobTitleQuery%22%3A%22software%22%2C%22searchQuery%22%3A%22new+grad%22%2C%22dateFetchedPastNDays%22%3A4%7D",
  },
  {
    name: "No YOE Required",
    url: "https://hiring.cafe/?searchState=%7B%22defaultToUserLocation%22%3Afalse%2C%22seniorityLevel%22%3A%5B%22No+Prior+Experience+Required%22%2C%22Entry+Level%22%5D%2C%22sortBy%22%3A%22date%22%2C%22jobTitleQuery%22%3A%22software%22%2C%22dateFetchedPastNDays%22%3A4%2C%22roleYoeRange%22%3A%5B0%2C0%5D%7D",
  },
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

async function getJobsFromHiringCafe(
  browser: Browser,
  searchState: SearchState,
): Promise<Job[]> {
  const page = await browser.newPage();

  try {
    const [response] = await Promise.all([
      page.waitForResponse((res) => {
        return (
          res.url().includes("/api/search-jobs?s=") && res.status() === 200
        );
      }),
      page.goto(searchState.url, { waitUntil: "networkidle" }),
    ]);

    if (!response || !response.ok()) {
      throw new Error("No response from Hiring Cafe");
    }

    const { results } = (await response.json()) as { results: any[] };

    const jobs = results.map((result) => jobSchema.parse(result));

    const mappedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.job_information.title,
      department: job.v5_processed_job_data.job_category,
      summary: job.v5_processed_job_data.requirements_summary,
      location: job.v5_processed_job_data.formatted_workplace_location,
      salary_min: job.v5_processed_job_data.yearly_min_compensation,
      salary_max: job.v5_processed_job_data.yearly_max_compensation,
      workplace_type: job.v5_processed_job_data.workplace_type,
      commitment: job.v5_processed_job_data.commitment,
      company: job.v5_processed_company_data.name ?? "Unknown",
      company_url: job.v5_processed_company_data.website ?? undefined,
      company_logo: job.v5_processed_company_data.image_url ?? undefined,
      min_industry_and_role_yoe:
        job.v5_processed_job_data.min_industry_and_role_yoe,
      technical_tools: job.v5_processed_job_data.technical_tools,
      url: job.apply_url,
      job_description: job.job_information.description,
      posted_at: job.v5_processed_job_data.estimated_publish_date,
      search_state: searchState.name,
    }));

    return mappedJobs;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getJobs(): Promise<Job[]> {
  const browser = await chromium.launch({ headless: true });
  const jobsMap = new Map<string, Job>();

  for (const searchState of searchStates) {
    const newJobs = await getJobsFromHiringCafe(browser, searchState);
    console.log(`Found ${newJobs.length} jobs from ${searchState.name}`);
    for (const job of newJobs) {
      if (!jobsMap.has(job.id)) {
        jobsMap.set(job.id, job);
      }
    }
  }

  await browser.close();
  return Array.from(jobsMap.values());
}
