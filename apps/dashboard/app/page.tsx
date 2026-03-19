import Jobs from "@/components/jobs";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getJobs } from "@/lib/jobs";
import { GetJobsResponse } from "@/lib/schemas";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const queryClient = new QueryClient();
  const params = await searchParams;

  const filter =
    params.filter === "browse" ||
    params.filter === "saved" ||
    params.filter === "archived"
      ? params.filter
      : "all";

  const sort =
    params.sort === "posted_newest" ||
    params.sort === "posted_oldest" ||
    params.sort === "company_az" ||
    params.sort === "company_za"
      ? params.sort
      : "posted_newest";

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["jobs", filter, sort],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      return getJobs({ cursor: pageParam, limit: 20, filter, sort });
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: GetJobsResponse) =>
      lastPage.nextCursor ?? undefined,
    pages: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Jobs />
    </HydrationBoundary>
  );
}
