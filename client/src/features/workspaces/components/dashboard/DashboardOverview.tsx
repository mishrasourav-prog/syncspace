import type { LucideIcon } from "lucide-react";
import { Archive, LayoutGrid, Mail, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardOverviewProps {
  total: number;
  active: number;
  archived: number;
  pendingInvitations: number;
  isLoading: boolean;
}

interface MetricCardProps {
  icon: LucideIcon;
  iconClassName: string;
  value: number;
  label: string;
}

function MetricCard({ icon: Icon, iconClassName, value, label }: MetricCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-semibold text-foreground">{value}</p>
        <p className="truncate text-caption">{label}</p>
      </div>
    </div>
  );
}

function MetricCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/60 p-4">
      <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-5 w-10" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function DashboardOverview({ total, active, archived, pendingInvitations, isLoading }: DashboardOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <MetricCard icon={LayoutGrid} iconClassName="bg-primary/15 text-primary" value={total} label="Total workspaces" />
      <MetricCard icon={Users} iconClassName="bg-secondary/15 text-secondary" value={active} label="Active workspaces" />
      <MetricCard icon={Archive} iconClassName="bg-warning/15 text-warning" value={archived} label="Archived workspaces" />
      <MetricCard icon={Mail} iconClassName="bg-success/15 text-success" value={pendingInvitations} label="Pending invitations" />
    </div>
  );
}
