import { Job } from "./job";
import { BatchJobSourceUnion, GoogleGenAI } from "@google/genai";
import { z } from "zod";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) throw new Error("API key not set");

const ai = new GoogleGenAI({ apiKey: API_KEY });

const candidate = `
TARGET ROLES:
- Frontend Engineer
- Full-stack Engineer
- Software Engineer / Software Developer

EXPERIENCE LEVEL:
- Entry Level / New Grad / Early Career
- 1 year professional experience
- 2 production web applications shipped end-to-end
- Experience owning features from design through deployment

CORE TECHNICAL SKILLS:
- React (Advanced)
- TypeScript (Advanced)
- Node.js (Intermediate)
- PostgreSQL (Intermediate)

ADDITIONAL TECHNOLOGIES (by proficiency):
1. TypeScript
2. React, Vite, Next.js
3. C#
4. Python
5. Docker
6. Java
7. C++

WORK PREFERENCES:
- Remote or Hybrid work preferred
- Startup or small team environment (flexible)
- Product-focused roles
- Collaborative team culture
`;

const displayName = "job-fit-batch";

const systemInstruction = `You are an expert technical recruiter evaluating candidate-job fit.

CANDIDATE PROFILE:
${candidate}

SCORING CRITERIA (0-100):
- Skills Match (40 points): How well do the candidate's technical skills align with the job requirements?
  * 35-40: Excellent match - candidate has all or most required skills at the right level
  * 25-34: Good match - candidate has most required skills
  * 15-24: Partial match - candidate has some required skills
  * 0-14: Poor match - significant skill gaps

- Experience Level (30 points): Does the candidate's experience level match the role?
  * 25-30: Perfect match - experience aligns with role expectations
  * 15-24: Close match - slight over/under qualification
  * 5-14: Questionable match - significant experience gap
  * 0-4: Poor match - major experience mismatch

- Tech Stack (20 points): Familiarity with the specific technologies mentioned?
  * 16-20: Highly familiar with most/all technologies
  * 10-15: Familiar with several key technologies
  * 5-9: Limited familiarity
  * 0-4: Minimal or no overlap

- Role Type (10 points): Does the role align with candidate's target roles and preferences?
  * 8-10: Strong alignment with target role and preferences
  * 5-7: Moderate alignment
  * 0-4: Poor alignment

When providing your reason, briefly explain the score by highlighting:
- Key skill matches or gaps
- Experience level alignment
- Notable technology overlaps or mismatches
- Any major strengths or deal-breakers`;

const outputSchema = z.object({
  job_id: z.string(),
  score: z.number(),
  reason: z.string(),
});

const createPrompts = (jobs: Job[]): BatchJobSourceUnion => {
  return jobs.map((job) => ({
    contents: [
      {
        parts: [
          {
            text: `Evaluate fit for this position:

Job ID: ${job.id}
Title: ${job.title}
Company: ${job.company}
Required Experience: ${job.min_industry_and_role_yoe ?? "Not specified"} years
Commitment: ${job.commitment?.join(", ") ?? "Not specified"}
Location: ${job.location ?? "Not specified"}
Workplace Type: ${job.workplace_type ?? "Not specified"}
Required Technologies: ${job.technical_tools?.join(", ") ?? "Not specified"}
Role Summary: ${job.summary ?? "No summary available"}

Evaluate the candidate's fit for this position.`,
            role: "user",
          },
        ],
      },
    ],
    config: {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      responseMimeType: "application/json",
      responseSchema: z.toJSONSchema(outputSchema),
    },
  }));
};

export async function generateFits(
  jobs: Job[],
): Promise<{ jobs: Job[]; batchJobName: string }> {
  const prompts = createPrompts(jobs);

  console.log(JSON.stringify(prompts, null, 2));

  const inlineBatchJob = await ai.batches.create({
    model: "gemini-2.5-flash-lite",
    src: prompts,
    config: {
      displayName,
    },
  });

  if (!inlineBatchJob.name) {
    throw new Error("Batch job name is undefined");
  }

  const jobsWithBatchJobNames: Job[] = jobs.map((job, index) => ({
    ...job,
    batch_job: {
      name: inlineBatchJob.name!,
      index,
    },
  }));

  console.log(JSON.stringify(jobsWithBatchJobNames, null, 2));

  return {
    jobs: jobsWithBatchJobNames,
    batchJobName: inlineBatchJob.name,
  };
}
