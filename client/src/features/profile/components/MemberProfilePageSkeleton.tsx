import { Skeleton } from "@/components/ui/skeleton";

export function MemberProfilePageSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading member profile">
      <section className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-24 w-24 shrink-0 rounded-full sm:h-28 sm:w-28" />
          <div className="w-full space-y-2 sm:w-72">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <section className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft sm:p-6">
          <Skeleton className="h-5 w-24" />
          <div className="mt-5 space-y-4">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft sm:p-6">
          <Skeleton className="h-5 w-36" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </section>
      </div>
    </div>
  );
}
