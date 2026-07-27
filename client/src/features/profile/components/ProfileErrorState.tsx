import { AlertCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileErrorStateProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ProfileErrorState({
  message,
  title = "Something went wrong",
  onRetry,
  compact = false,
}: ProfileErrorStateProps) {
  return (
    <section
      role="alert"
      className={cn(
        "rounded-xl border border-danger/25 bg-danger/5 text-center",
        compact ? "p-4" : "p-6 sm:p-8"
      )}
    >
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-danger/15 text-danger">
        <AlertCircle className="h-5 w-5" aria-hidden />
      </span>
      <h2 className="mt-3 text-base font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-1 max-w-xl text-sm leading-6 text-muted">{message}</p>

      {onRetry ? (
        <Button type="button" size="sm" variant="secondary" className="mt-4" onClick={onRetry}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Retry
        </Button>
      ) : null}
    </section>
  );
}
