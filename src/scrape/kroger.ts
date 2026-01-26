import { chromium } from "playwright";
import { Job, jobSchema } from "../job";

export const scrapeKroger = async (): Promise<Job[]> => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(
      "https://www.krogerfamilycareers.com/en/sites/CX_2001/jobs?keyword=software&lastSelectedFacet=POSTING_DATES&mode=location&selectedFlexFieldsFacets=%22AttributeChar4%7CTechnology+and+Digital%22&selectedPostingDatesFacet=7&sortBy=POSTING_DATES_DESC",
    );

    await page.locator(".jobs-list__list").waitFor({ state: "visible" });

    const jobData = await page
      .locator(".job-list-item")
      .evaluateAll((nodes) => {
        return nodes.map((el) => {
          const infoElements = el.querySelectorAll(
            ".job-list-item__job-info-value",
          );

          const location = el
            .querySelector('span[data-bind="html: primaryLocation"]')
            ?.textContent?.trim();

          const date = infoElements[1]?.textContent?.trim();

          return {
            title: el.querySelector(".job-tile__title")?.textContent?.trim(),
            location,
            date,
            url: el
              .querySelector("a.job-list-item__link")
              ?.getAttribute("href"),
          };
        });
      });

    const jobs = jobData.map((job) => ({
      id: job.url,
      title: job.title,
      url: job.url,
      company: "Kroger",
      location: job.location,
      department: "Software Engineering",
      posted_at: job.date,
    }));

    return jobs.map((job) => jobSchema.parse(job));
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await browser.close();
  }
};
