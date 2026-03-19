"use client";

import { Button } from "@/components/ui/button";
import {
  useInfiniteQuery,
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getJobsResponseSchema,
  type GetJobsResponse,
  type Job,
  type JobFilter,
  type JobSort,
} from "@/lib/schemas";
import { useMemo } from "react";
import { ArrowUpDown, FileIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import JobCard from "./job-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { archiveAllUnsavedJobs } from "@/app/actions";
import { Spinner } from "./ui/spinner";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "./ui/empty";

export default function Jobs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const filter = useMemo<JobFilter>(() => {
    const f = searchParams.get("filter");
    if (f === "browse" || f === "saved" || f === "archived") {
      return f;
    }
    return "all";
  }, [searchParams]);

  const sort = useMemo<JobSort>(() => {
    const s = searchParams.get("sort");
    if (
      s === "posted_newest" ||
      s === "posted_oldest" ||
      s === "company_az" ||
      s === "company_za"
    ) {
      return s;
    }
    return "posted_newest";
  }, [searchParams]);

  const setFilter = (newFilter: JobFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", newFilter);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const setSort = (newSort: JobSort) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === "posted_newest") {
      params.delete("sort");
    } else {
      params.set("sort", newSort);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<
      GetJobsResponse,
      Error,
      InfiniteData<GetJobsResponse>,
      readonly unknown[],
      string | undefined
    >({
      queryKey: ["jobs", filter, sort],
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams({ limit: "20" });

        if (filter !== "all") {
          params.set("filter", filter);
        }

        if (sort !== "posted_newest") {
          params.set("sort", sort);
        }

        if (pageParam) {
          params.set("cursor", pageParam);
        }

        const res = await fetch(`/api/jobs?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch jobs");

        const data = await res.json();
        return getJobsResponseSchema.parse(data);
      },
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  const archiveAllUnsavedJobsMutation = useMutation({
    mutationFn: async () => {
      const result = await archiveAllUnsavedJobs();
      if (!result.success) {
        throw new Error(result.error || "Failed to archive all unsaved jobs");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const jobs = data?.pages.flatMap((page) => page.jobs) ?? [];

  return (
    <div className="min-h-screen">
      <div className="flex flex-col gap-4 pb-4">
        <h1 className="text-xl font-bold">Jobs</h1>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "browse" ? "default" : "outline"}
              onClick={() => setFilter("browse")}
            >
              Browse
            </Button>
            <Button
              variant={filter === "saved" ? "default" : "outline"}
              onClick={() => setFilter("saved")}
            >
              Saved
            </Button>
            <Button
              variant={filter === "archived" ? "default" : "outline"}
              onClick={() => setFilter("archived")}
            >
              Archived
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={archiveAllUnsavedJobsMutation.isPending}
                >
                  {archiveAllUnsavedJobsMutation.isPending && (
                    <Spinner className="h-4 w-4" />
                  )}
                  Archive Unsaved
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive Unsaved Jobs</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to archive all unsaved jobs?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => archiveAllUnsavedJobsMutation.mutate()}
                  >
                    Archive Unsaved Jobs
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="posted_newest">Newest First</SelectItem>
                <SelectItem value="posted_oldest">Oldest First</SelectItem>
                <SelectItem value="company_az">Company A-Z</SelectItem>
                <SelectItem value="company_za">Company Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {jobs.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <FileIcon className="h-10 w-10 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No jobs found</EmptyTitle>
            <EmptyDescription>
              Try changing the filter or sort.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {jobs.map((job: Job) => (
            <JobCard
              key={job._id.toString()}
              job={job}
              filter={filter}
              sort={sort}
            />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
            size="lg"
          >
            {isFetchingNextPage && <Spinner className="h-4 w-4" />}
            Load More Jobs
          </Button>
        </div>
      )}
    </div>
  );
}
