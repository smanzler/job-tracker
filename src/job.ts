import { z } from "zod";

export const jobSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  url: z.string(),
  job_description: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  posted_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Job = z.infer<typeof jobSchema>;
