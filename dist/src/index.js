"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const unique_1 = require("./unique");
const notify_1 = require("./notify");
const hc_1 = require("./hc");
async function main() {
    const jobs = await (0, hc_1.getJobs)();
    console.log(`Found ${jobs.length} jobs`);
    // const interestingJobs = jobs.filter((job) => isInteresting(job));
    // console.log(`Found ${interestingJobs.length} interesting jobs`);
    const uniqueJobs = await (0, unique_1.getUniqueJobs)(jobs);
    console.log(`Found ${uniqueJobs.length} unique jobs`);
    const sortedJobs = uniqueJobs.sort((a, b) => {
        return a.posted_at.getTime() - b.posted_at.getTime();
    });
    for (const job of sortedJobs) {
        await (0, notify_1.notify)(job);
    }
}
main().catch(console.error);
