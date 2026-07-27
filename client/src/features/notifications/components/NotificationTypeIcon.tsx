import { MessageSquareReply, RefreshCw, UserRoundCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationType } from "../notification.types";

interface NotificationTypeIconProps {
  type: NotificationType;
  className?: string;
}

const TYPE_STYLES: Record<NotificationType, { icon: typeof UserRoundCheck; classes: string }> = {
  task_assigned: { icon: UserRoundCheck, classes: "bg-success/15 text-success" },
  task_status_changed: { icon: RefreshCw, classes: "bg-primary/15 text-primary" },
  "discussion.reply": { icon: MessageSquareReply, classes: "bg-warning/15 text-warning" },
};

export function NotificationTypeIcon({ type, className }: NotificationTypeIconProps) {
  const { icon: Icon, classes } = TYPE_STYLES[type] ?? { icon: UserRoundCheck, classes: "bg-surface text-muted" };

  return (
    <span
      className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", classes, className)}
      aria-hidden
    >
      <Icon className="h-4.5 w-4.5" />
    </span>
  );
}
