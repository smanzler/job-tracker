import { z } from "zod";

export const jobSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  company_url: z.string().optional(),
  company_logo: z.string().optional(),
  min_industry_and_role_yoe: z.number().nullable(),
  technical_tools: z.array(z.string()).optional(),
  url: z.string(),
  summary: z.string(),
  job_description: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  salary_min: z.number().nullable(),
  salary_max: z.number().nullable(),
  workplace_type: z.string().optional(),
  commitment: z.array(z.string()).optional(),
  posted_at: z.coerce.date(),
  search_state: z.string(),
});

export type Job = z.infer<typeof jobSchema>;
