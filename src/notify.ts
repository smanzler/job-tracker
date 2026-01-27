import { Job } from "./job";

export async function notify(job: Job) {
  await fetch(process.env.DISCORD_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `${job.title} - ${job.posted_at.toLocaleDateString()}\n${job.company}\n\n${job.url}`,
    }),
  });
}
