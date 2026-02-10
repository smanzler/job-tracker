import { matmul, pipeline } from "@huggingface/transformers";
import { Job } from "./job";

type FitScore = {
  id: string;
  desc: string;
  fit_score?: number;
};

const candidate = `
Role target:
Frontend / Full-stack Engineer / Software Engineer / Software Developer
Entry Level / New Grad / Early Career

Core skills:
- React (advanced)
- TypeScript (advanced)
- Node.js (intermediate)
- PostgreSQL (intermediate)

Experience:
- 1 years professional experience
- Shipped 2 production web apps end-to-end
- Owned features from design to deployment

Tech stack exposure in order of proficiency:
- TypeScript
- React, Vite, Next.js
- C#
- Python
- Docker
- Java
- C++
  `;

export async function getFits(jobs: Job[]): Promise<Job[]> {
  const embed = await pipeline(
    "feature-extraction",
    "onnx-community/Qwen3-Embedding-0.6B-ONNX",
  );

  const inputJobs = jobs
    .filter((job) => !!job.job_description)
    .map((job) => ({
      id: job.id,
      desc: job.job_description!,
    }));

  const inputTexts = [candidate, ...inputJobs.map((job) => job.desc)];

  const embeddings = await embed(inputTexts, {
    pooling: "last_token",
    normalize: true,
  });

  const numRows = embeddings.dims[0];

  const candidateTensor = embeddings.slice([0, 1]);
  const jobsTensor = embeddings.slice([1, numRows]);

  const scores = await matmul(candidateTensor, jobsTensor.transpose(1, 0));
  const scoresArray = scores.tolist()[0];

  const jobsWithFit: FitScore[] = inputJobs.map((job, i) => ({
    ...job,
    fit_score: scoresArray[i],
  }));

  console.log(`Found ${jobsWithFit.length} fitted jobs`);

  const jobsWithFitScores = jobs.map((job) => ({
    ...job,
    fit_score:
      jobsWithFit.find((score) => score.id === job.id)?.fit_score ?? null,
  }));

  return jobsWithFitScores;
}
