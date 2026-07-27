import { Skeleton } from "@/components/ui/skeleton";

export function NotificationPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[230px_minmax(420px,1fr)_380px]">
        <div className="hidden rounded-xl border border-border bg-surface/60 p-2 xl:block">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="mb-1 h-9 w-full rounded-lg" />
          ))}
        </div>

        <div className="rounded-xl border border-border bg-surface/60">
          <div className="border-b border-border p-3">
            <Skeleton className="h-5 w-32" />
          </div>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-b-0">
              <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
          ))}
        </div>

        <div className="hidden rounded-xl border border-border bg-surface/60 p-4 xl:block">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
