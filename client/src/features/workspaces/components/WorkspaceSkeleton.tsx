import { Skeleton } from "@/components/ui/skeleton";

export function WorkspaceCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface/60 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-1.5 h-3 w-2/3" />
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function WorkspaceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <WorkspaceCardSkeleton key={index} />
      ))}
    </div>
  );
}
