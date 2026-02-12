# Jobby Scraper

This is the scraping and AI processing engine for [Jobby](https://github.com/smanzler/job-dashboard).

Automatically pulls job postings from HiringCafe, processes them with AI to generate a fit score based on my qualifications, and saves everything to MongoDB for the dashboard to display.

## How It Works

- Scrape jobs from HiringCafe.
- Process each job using AI to calculate a fit score.
- Push jobs to MongoDB.
- Dashboard reads from MongoDB to display, save, and archive jobs.

## Tech Stack

- Node.js for scripting
- MongoDB for storage
- AI Processing - @huggingface/transformers
- Scheduling: Can be run manually or on a cron job
