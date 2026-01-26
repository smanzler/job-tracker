export async function notify(job: { title: string; url: string }) {
  await fetch(process.env.SLACK_WEBHOOK!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `🆕 New job posted:\n*${job.title}*\n${job.url}`,
    }),
  });
}
