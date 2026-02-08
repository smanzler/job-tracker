import { Job } from "./job";

const content = (jobs: Job[], errors: string[]) => {
  if (jobs.length === 0) {
    return "No new jobs found";
  }

  const categories = [
    "TypeScript",
    "Early Career",
    "New Grad",
    "No YOE Required",
  ];

  const link = `[View all jobs](https://jobby.simonmanzler.com)`;

  const lines = categories.map((category) => {
    const count = jobs.filter((job) => job.search_state === category).length;
    return `- ${count} ${category} jobs`;
  });

  const errorSection =
    errors.length > 0
      ? [
          "",
          `**Errors (${errors.length}):**`,
          ...errors.map((err) => `- ${err}`),
        ]
      : [];

  return [
    `**Found ${jobs.length} jobs:**`,
    ...lines,
    "",
    link,
    ...errorSection,
  ].join("\n");
};

export async function notify(jobs: Job[], errors: string[]): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("DISCORD_WEBHOOK_URL is not set, skipping notification");
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: content(jobs, errors),
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Discord webhook failed with status ${response.status}: ${response.statusText}`
      );
    }

    console.log("Successfully sent Discord notification");
  } catch (error) {
    console.error("Failed to send Discord notification:", error);
    throw new Error(
      `Discord notification failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
