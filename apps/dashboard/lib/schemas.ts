import { z } from "zod";

export const jobSchema = z.object({
  _id: z.string(),
  id: z.string(),
  title: z.string(),
  company: z.string(),
  company_url: z.string().nullable(),
  company_logo: z.string().nullable(),
  min_industry_and_role_yoe: z.number().nullable(),
  technical_tools: z.array(z.string()).nullable(),
  url: z.string(),
  summary: z.string().nullable(),
  job_description: z.string().nullable(),
  department: z.string().nullable(),
  location: z.string().nullable(),
  salary_min: z.number().nullable(),
  salary_max: z.number().nullable(),
  workplace_type: z.string().nullable(),
  commitment: z.array(z.string()).nullable(),
  posted_at: z.coerce.date(),
  search_state: z.string(),
  saved: z.boolean().optional().default(false),
  archived: z.boolean().optional().default(false),
  appliedAt: z.union([z.date(), z.string(), z.null()]).optional().default(null),
  fit_score: z.number().nullable().optional(),
});

export type Job = z.infer<typeof jobSchema>;

export const getJobsResponseSchema = z.object({
  jobs: z.array(jobSchema),
  nextCursor: z.string().nullable(),
});

export type GetJobsResponse = z.infer<typeof getJobsResponseSchema>;

export const jobFilterSchema = z.enum(["all", "browse", "saved", "archived"]);

export type JobFilter = z.infer<typeof jobFilterSchema>;

export const jobSortSchema = z.enum([
  "posted_newest",
  "posted_oldest",
  "company_az",
  "company_za",
]);

export type JobSort = z.infer<typeof jobSortSchema>;
