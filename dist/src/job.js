"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobSchema = void 0;
const zod_1 = require("zod");
exports.jobSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    company: zod_1.z.string(),
    company_url: zod_1.z.string().optional(),
    company_logo: zod_1.z.string().optional(),
    min_industry_and_role_yoe: zod_1.z.number().nullable(),
    technical_tools: zod_1.z.array(zod_1.z.string()).optional(),
    url: zod_1.z.string(),
    summary: zod_1.z.string(),
    job_description: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    salary_min: zod_1.z.number().nullable(),
    salary_max: zod_1.z.number().nullable(),
    workplace_type: zod_1.z.string().optional(),
    commitment: zod_1.z.array(zod_1.z.string()).optional(),
    posted_at: zod_1.z.coerce.date(),
    search_state: zod_1.z.string(),
});
