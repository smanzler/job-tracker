import { Job } from "./job";

const KEYWORDS = ["ios", "mobile", "frontend", "react", "swift"];

export function isInteresting(job: Job): boolean {
  const text = job.title.toLowerCase();
  return KEYWORDS.some((k) => text.includes(k));
}
