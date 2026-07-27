import { Skeleton } from "@/components/ui/skeleton";

export function ProfilePageSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading profile">
      <section className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft sm:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Skeleton className="h-24 w-24 shrink-0 rounded-full sm:h-28 sm:w-28" />
            <div className="w-full space-y-2 sm:w-64">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-6 w-44" />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[470px]">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, cardIndex) => (
          <section
            key={cardIndex}
            className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft sm:p-6"
          >
            <Skeleton className="h-5 w-44" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 5 }).map((__, rowIndex) => (
                <div key={rowIndex} className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-xl border border-danger/30 bg-danger/5 p-5 sm:p-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </section>
    </div>
  );
}
