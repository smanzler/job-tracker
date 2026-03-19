import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  Archive,
  ArchiveX,
  Bookmark,
  BookmarkX,
  MoreVertical,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ReactHtmlParser from "react-html-parser";
import { Job, JobFilter, JobSort } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  toggleJobSaved,
  toggleJobArchived,
  toggleJobApplied,
} from "@/app/actions";
import { Spinner } from "./ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function JobCard({
  job,
  filter,
  sort,
}: {
  job: Job;
  filter: JobFilter;
  sort: JobSort;
}) {
  const queryClient = useQueryClient();

  const toggleSavedMutation = useMutation({
    mutationFn: async ({ jobId, saved }: { jobId: string; saved: boolean }) => {
      const result = await toggleJobSaved(jobId, saved);
      if (!result.success) {
        throw new Error(result.error || "Failed to toggle saved");
      }
      return { jobId, saved };
    },
    onSuccess: ({ jobId, saved }: { jobId: string; saved: boolean }) => {
      console.log("onSuccess", filter, sort);
      queryClient.setQueryData(["jobs", filter, sort], (old: any) => {
        console.log("setQueryData", jobId);
        return {
          ...old,
          pages: old.pages.map(
            (page: { jobs: Job[]; nextCursor: string | null }) => ({
              ...page,
              jobs: page.jobs
                .map((job) => (job._id === jobId ? { ...job, saved } : job))
                .filter((job: Job) => {
                  if (job._id !== jobId) {
                    return true;
                  }

                  // Remove job from list if it's being unsaved in 'all' or 'saved', or being saved in any other filter
                  return !(
                    ((filter === "all" || filter === "saved") &&
                      saved === false) ||
                    (filter !== "all" && filter !== "saved" && saved === true)
                  );
                }),
            }),
          ),
        };
      });
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const toggleArchivedMutation = useMutation({
    mutationFn: async ({
      jobId,
      archived,
    }: {
      jobId: string;
      archived: boolean;
    }) => {
      const result = await toggleJobArchived(jobId, archived);
      if (!result.success) {
        throw new Error(result.error || "Failed to update");
      }
      return { jobId, archived };
    },
    onSuccess: ({ jobId, archived }: { jobId: string; archived: boolean }) => {
      queryClient.setQueryData(
        ["jobs", filter, sort],
        (old: {
          pages: { jobs: Job[]; nextCursor: string | null }[];
          pageParams: string[];
        }) => {
          console.log("setQueryData", old);
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              jobs: page.jobs
                .map((job) => (job._id === jobId ? { ...job, archived } : job))
                .filter((job) => {
                  if (job._id !== jobId) {
                    return true;
                  }

                  // Remove job from list if it's being archived in 'archived', or being unarchived in any other filter
                  return !(
                    (filter === "archived" && archived === false) ||
                    (filter !== "archived" && archived === true)
                  );
                }),
            })),
          };
        },
      );
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const toggleAppliedMutation = useMutation({
    mutationFn: async ({
      jobId,
      applied,
    }: {
      jobId: string;
      applied: boolean;
    }) => {
      console.log("toggleAppliedMutation", jobId, applied);
      const result = await toggleJobApplied(jobId, applied);
      if (!result.success) {
        throw new Error(result.error || "Failed to toggle applied");
      }
      return { jobId, applied };
    },
    onSuccess: ({ jobId, applied }: { jobId: string; applied: boolean }) => {
      console.log("success");
      queryClient.setQueryData(
        ["jobs", filter, sort],
        (old: {
          pages: { jobs: Job[]; nextCursor: string | null }[];
          pageParams: string[];
        }) => {
          console.log("setQueryData", old);
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              jobs: page.jobs.map((job) =>
                job._id === jobId
                  ? { ...job, appliedAt: applied ? new Date() : null }
                  : job,
              ),
            })),
          };
        },
      );
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  return (
    <Card className="relative overflow-visible">
      <CardHeader>
        <div className="pb-4 flex flex-row gap-4 items-center">
          {job.company_logo && (
            <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
              <img
                src={job.company_logo}
                alt={job.company}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            {job.company_url ? (
              <Link
                href={
                  job.company_url.startsWith("http://") ||
                  job.company_url.startsWith("https://")
                    ? job.company_url
                    : `https://${job.company_url}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <p className="font-bold line-clamp-1 hover:underline">
                  {job.company}
                </p>
              </Link>
            ) : (
              <p className="font-bold line-clamp-1">{job.company}</p>
            )}
          </div>
          <Badge variant="secondary">
            {formatDistanceToNow(job.posted_at, { addSuffix: true })}
          </Badge>
        </div>
        <div className="pb-2">
          <CardTitle>{job.title}</CardTitle>
          {job.location && <Badge className="mt-2">{job.location}</Badge>}
          {(job.min_industry_and_role_yoe !== null ||
            job.salary_min ||
            job.salary_max !== null) && (
            <div className="flex flex-wrap gap-1 items-center pt-2">
              {job.min_industry_and_role_yoe !== null && (
                <Badge variant="secondary">
                  {job.min_industry_and_role_yoe}+ YOE
                </Badge>
              )}
              {(job.salary_min || job.salary_max !== null) && (
                <Badge variant="secondary">
                  {[job.salary_min, job.salary_max]
                    .filter(Boolean)
                    .map((salary) =>
                      salary != null
                        ? `$${Math.round(Number(salary) / 1000)}k`
                        : "",
                    )
                    .join("-")}
                </Badge>
              )}
              {job.workplace_type && (
                <Badge variant="secondary">{job.workplace_type}</Badge>
              )}
              {job.commitment &&
                job.commitment.length > 0 &&
                job.commitment.map((commitment: string) => (
                  <Badge variant="secondary" key={commitment}>
                    {commitment}
                  </Badge>
                ))}
            </div>
          )}
        </div>

        <CardDescription>{job.summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {job.technical_tools && job.technical_tools.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            {[...new Set(job.technical_tools)].map((tool: string) => (
              <Badge variant="outline" key={tool}>
                {tool}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground text-center">
          Search Source: <span className="font-bold">{job.search_state}</span>
        </p>

        <div className="flex flex-row gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              toggleSavedMutation.mutate({ jobId: job._id, saved: !job.saved })
            }
            title="Toggle saved"
            disabled={toggleSavedMutation.isPending}
          >
            {toggleSavedMutation.isPending ? (
              <Spinner className="h-4 w-4" />
            ) : job.saved ? (
              <BookmarkX className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">View Job Description</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Job Description</DialogTitle>
                <DialogDescription>{job.title}</DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto min-h-0">
                {ReactHtmlParser(job.job_description ?? "", {
                  transform: (node) => {
                    if (node.type === "img") return null;
                  },
                })}
              </div>
              <DialogFooter>
                <Button className="w-full" asChild>
                  <Link
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      !job.appliedAt &&
                      toggleAppliedMutation.mutate({
                        jobId: job._id,
                        applied: true,
                      })
                    }
                  >
                    Apply
                  </Link>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button asChild>
            <Link
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                !job.appliedAt &&
                toggleAppliedMutation.mutate({
                  jobId: job._id,
                  applied: true,
                })
              }
            >
              Apply
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() =>
                  toggleArchivedMutation.mutate({
                    jobId: job._id,
                    archived: !job.archived,
                  })
                }
              >
                {job.archived ? (
                  <ArchiveX className="h-4 w-4" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                {job.archived ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  toggleSavedMutation.mutate({
                    jobId: job._id,
                    saved: !job.saved,
                  })
                }
              >
                {job.saved ? (
                  <BookmarkX className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                {job.saved ? "Unsave" : "Save"}
              </DropdownMenuItem>
              {job.appliedAt && (
                <DropdownMenuItem
                  onClick={() =>
                    toggleAppliedMutation.mutate({
                      jobId: job._id,
                      applied: false,
                    })
                  }
                >
                  <X className="h-4 w-4" />
                  Unapply
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>

      <div className="flex flex-row gap-2 absolute top-0 left-0 -translate-x-2 -translate-y-2">
        {job.fit_score !== null && job.fit_score !== undefined && (
          <div className="bg-background rounded-full">
            <Badge
              className={cn(
                "font-semibold",
                job.fit_score >= 75
                  ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                  : job.fit_score >= 50
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                    : job.fit_score >= 25
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                      : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
              )}
            >
              Fit: {job.fit_score}%
            </Badge>
          </div>
        )}
      </div>
      <div className="flex flex-row gap-2 absolute top-0 right-0 translate-x-2 -translate-y-2">
        {job.appliedAt && (
          <div className="bg-background rounded-full">
            <Badge variant="secondary">Applied</Badge>
          </div>
        )}
        {job.saved && (
          <div className="bg-background rounded-full">
            <Badge variant="default">Saved</Badge>
          </div>
        )}
        {job.archived && (
          <div className="bg-background rounded-full">
            <Badge variant="destructive">Archived</Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
