import { Job } from "./job";

const CAREER_LEVEL_KEYWORDS = [
  "junior",
  "entry level",
  "entry-level",
  "associate",
  "early career",
  "new grad",
  "graduate",
  "intern",
  "level 1",
  "i",
];

const ROLE_KEYWORDS = [
  "software",
  "developer",
  "engineer",
  "programmer",
  "full stack",
  "full-stack",
  "backend",
  "back-end",
  "frontend",
  "front-end",
  "web developer",
  "application developer",
];

const TECH_KEYWORDS = [
  "javascript",
  "typescript",
  "python",
  "java",
  "react",
  "node",
  "ios",
  "swift",
  "c#",
];

const EXCLUDE_KEYWORDS = ["senior"];

export function isInteresting(job: Job): boolean {
  const title = job.title.toLowerCase();
  const description = job.job_description?.toLowerCase() || "";
  const combinedText = `${title} ${description}`;

  const hasSeniorKeyword = EXCLUDE_KEYWORDS.some((keyword) =>
    title.includes(keyword),
  );

  if (hasSeniorKeyword) {
    console.log(`Skipping job ${job.title} because it contains senior keyword`);
    return false;
  }

  const isSoftwareRole = ROLE_KEYWORDS.some((keyword) =>
    combinedText.includes(keyword),
  );
  if (!isSoftwareRole) {
    console.log(`Skipping job ${job.title} because it is not a software role`);
    return false;
  }

  const hasCareerLevelKeyword = CAREER_LEVEL_KEYWORDS.some((keyword) =>
    combinedText.includes(keyword),
  );

  const hasTechKeyword = TECH_KEYWORDS.some((keyword) =>
    combinedText.includes(keyword),
  );

  return hasCareerLevelKeyword || hasTechKeyword;
}
