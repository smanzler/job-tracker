"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobs = getJobs;
const playwright_1 = require("playwright");
const zod_1 = require("zod");
const searchStates = [
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
const jobSchema = zod_1.z.object({
    id: zod_1.z.string(),
    apply_url: zod_1.z.string(),
    job_information: zod_1.z.object({
        title: zod_1.z.string(),
        description: zod_1.z.string(),
    }),
    v5_processed_job_data: zod_1.z.object({
        core_job_title: zod_1.z.string(),
        requirements_summary: zod_1.z.string(),
        technical_tools: zod_1.z.array(zod_1.z.string()),
        seniority_level: zod_1.z.string(),
        job_category: zod_1.z.string(),
        commitment: zod_1.z.array(zod_1.z.string()),
        workplace_type: zod_1.z.string(),
        formatted_workplace_location: zod_1.z.string(),
        yearly_min_compensation: zod_1.z.union([zod_1.z.number(), zod_1.z.null()]),
        yearly_max_compensation: zod_1.z.union([zod_1.z.number(), zod_1.z.null()]),
        estimated_publish_date: zod_1.z.coerce.date(),
        min_industry_and_role_yoe: zod_1.z.union([zod_1.z.number(), zod_1.z.null()]),
    }),
    v5_processed_company_data: zod_1.z.object({
        name: zod_1.z.string(),
        website: zod_1.z.string().nullable(),
    }),
});
async function getJobsFromHiringCafe(browser, searchState) {
    const page = await browser.newPage();
    try {
        const [response] = await Promise.all([
            page.waitForResponse((res) => {
                return (res.url().includes("/api/search-jobs?s=") && res.status() === 200);
            }),
            page.goto(searchState.url, { waitUntil: "networkidle" }),
        ]);
        if (!response || !response.ok()) {
            throw new Error("No response from Hiring Cafe");
        }
        const { results } = (await response.json());
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
            company_logo: job.v5_processed_company_data.website
                ? `https://www.google.com/s2/favicons?domain=${job.v5_processed_company_data.website}&sz=128`
                : undefined,
            min_industry_and_role_yoe: job.v5_processed_job_data.min_industry_and_role_yoe,
            technical_tools: job.v5_processed_job_data.technical_tools,
            url: job.apply_url,
            job_description: job.job_information.description,
            posted_at: job.v5_processed_job_data.estimated_publish_date,
            search_state: searchState.name,
        }));
        return mappedJobs;
    }
    catch (error) {
        console.error(error);
        return [];
    }
}
async function getJobs() {
    const browser = await playwright_1.chromium.launch({ headless: true });
    const jobsMap = new Map();
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
