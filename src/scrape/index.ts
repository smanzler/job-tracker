import { Job } from "../job";
import { scrape8451 } from "./8451";
import { scrapeKroger } from "./kroger";

export type Scraper = {
  name: string;
  scrape: () => Promise<Job[]>;
};

export const scrapers: Scraper[] = [
  {
    name: "84.51",
    scrape: () => scrape8451(),
  },
  {
    name: "Kroger",
    scrape: () => scrapeKroger(),
  },
];
