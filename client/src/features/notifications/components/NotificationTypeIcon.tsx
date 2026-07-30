import {
  ClipboardPlus,
  FolderKanban,
  HandHelping,
  Mail,
  MessageSquarePlus,
  MessageSquareReply,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  UserRoundCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationType } from "../notification.types";

interface NotificationTypeIconProps {
  type: NotificationType;
  className?: string;
}

const TYPE_STYLES: Record<
  NotificationType,
  { icon: typeof UserRoundCheck; classes: string }
> = {
  task_assigned: {
    icon: UserRoundCheck,
    classes: "bg-success/15 text-success",
  },
  task_status_changed: {
    icon: RefreshCw,
    classes: "bg-primary/15 text-primary",
  },
  task_created: { icon: ClipboardPlus, classes: "bg-primary/15 text-primary" },
  "task.assignment_requested": {
    icon: HandHelping,
    classes: "bg-warning/15 text-warning",
  },
  "task.assignment_request_accepted": {
    icon: ShieldCheck,
    classes: "bg-success/15 text-success",
  },
  "discussion.created": {
    icon: MessageSquarePlus,
    classes: "bg-primary/15 text-primary",
  },
  "discussion.reply": {
    icon: MessageSquareReply,
    classes: "bg-warning/15 text-warning",
  },
  "workspace.invitation": { icon: Mail, classes: "bg-primary/15 text-primary" },
  "project.invitation": {
    icon: FolderKanban,
    classes: "bg-primary/15 text-primary",
  },
  "workspace.role_changed": {
    icon: ShieldCheck,
    classes: "bg-warning/15 text-warning",
  },
  "project.role_changed": {
    icon: ShieldCheck,
    classes: "bg-warning/15 text-warning",
  },
  "workspace.member_joined": {
    icon: UserPlus,
    classes: "bg-success/15 text-success",
  },
  "project.member_joined": {
    icon: UserPlus,
    classes: "bg-success/15 text-success",
  },
};

export function NotificationTypeIcon({
  type,
  className,
}: NotificationTypeIconProps) {
  const { icon: Icon, classes } = TYPE_STYLES[type] ?? {
    icon: UserRoundCheck,
    classes: "bg-surface text-muted",
  };

  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
        classes,
        className,
      )}
      aria-hidden
    >
      <Icon className="h-4.5 w-4.5" />
    </span>
  );
}
