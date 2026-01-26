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
  "level 2",
  "i",
  "ii",
];

const ROLE_KEYWORDS = [
  "software engineer",
  "software developer",
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
  "angular",
  "vue",
  "ios",
  "swift",
  "android",
  "kotlin",
  "c++",
  "c#",
  "go",
  "rust",
  "ruby",
];

const EXCLUDE_KEYWORDS = [
  "senior",
  "sr.",
  "lead",
  "principal",
  "staff",
  "architect",
  "director",
  "manager",
  "head of",
  "vp",
  "vice president",
  "chief",
  "level 3",
  "level 4",
  "level 5",
  "iii",
  "iv",
  "v",
  "10+ years",
  "8+ years",
];

export function isInteresting(job: Job): boolean {
  const title = job.title.toLowerCase();
  const description = job.job_description?.toLowerCase() || "";
  const combinedText = `${title} ${description}`;

  const hasSeniorKeyword = EXCLUDE_KEYWORDS.some((keyword) =>
    title.includes(keyword),
  );

  if (hasSeniorKeyword) {
    return false;
  }

  const isSoftwareRole = ROLE_KEYWORDS.some((keyword) =>
    combinedText.includes(keyword),
  );
  if (!isSoftwareRole) {
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
