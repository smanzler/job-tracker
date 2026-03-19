# [Jobby](https://jobby.simonmanzler.com)

I am looking for a job and I thought I would make a project out of it!

Jobby is a personal job-tracking dashboard that shows job postings scraped from HiringCafe and scored by AI based on my qualifications.

The actual scraping and AI scoring happens in a separate repo, [job-tracker](https://github.com/smanzler/job-tracker). This repo is just the dashboard.

## Some of the features I added

- AI Fit Scores so I can quickly identify which roles are a good match for me.
- Infinite scroll with React Query hydration from the server
- Protected by a secret HTTP-only token, so only I can save or archive jobs

## Screenshots

<img width="3840" height="2250" alt="image" src="https://github.com/user-attachments/assets/01d5f0cd-dfaf-4e57-b25b-3394521e8de1" />

## Tech Stack

- Frontend: Next.js, React Query
- Database: MongoDB
- AI Processing: @huggingface/transformers
