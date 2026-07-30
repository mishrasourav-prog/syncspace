import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardSectionErrorProps {
  message: string;
  onRetry: () => void;
  compact?: boolean;
}

export function DashboardSectionError({
  message,
  onRetry,
  compact,
}: DashboardSectionErrorProps) {
  return (
    <div
      className={
        compact
          ? "flex flex-col items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-4 py-6 text-center"
          : "flex flex-col items-center gap-3 rounded-xl border border-danger/30 bg-danger/5 px-6 py-10 text-center"
      }
    >
      <AlertCircle className="h-5 w-5 text-danger" />
      <p className="text-body">{message}</p>
      <Button size="sm" variant="secondary" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
