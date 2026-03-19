import { NextResponse } from "next/server";
import { getJobs } from "@/lib/jobs";
import { jobFilterSchema, jobSortSchema } from "@/lib/schemas";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = Number(searchParams.get("limit") ?? 20);
    const filter = searchParams.get("filter") ?? "all";
    const sort = searchParams.get("sort") ?? "posted_newest";

    const data = await getJobs({
      cursor,
      limit,
      filter: jobFilterSchema.parse(filter),
      sort: jobSortSchema.parse(sort),
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
