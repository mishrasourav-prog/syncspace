import type { LucideIcon } from "lucide-react";
import { Bell, FolderPlus, Mail, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";

interface DashboardQuickActionsProps {
  onCreateWorkspace: () => void;
  activeCount: number;
  pendingInvitationCount: number;
  unreadNotificationCount: number;
}

function scrollToSection(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

interface QuickActionProps {
  icon: LucideIcon;
  iconClassName: string;
  label: string;
  helper: string;
  onClick: () => void;
}

function QuickAction({
  icon: Icon,
  iconClassName,
  label,
  helper,
  onClick,
}: QuickActionProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface/60 p-3.5 text-left shadow-soft transition-colors hover:border-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-foreground">
          {label}
        </span>
        <span className="block truncate text-caption">{helper}</span>
      </span>
    </motion.button>
  );
}

export function DashboardQuickActions({
  onCreateWorkspace,
  activeCount,
  pendingInvitationCount,
  unreadNotificationCount,
}: DashboardQuickActionsProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  function focusActiveWorkspaces() {
    const next = new URLSearchParams(searchParams);
    next.set("status", "active");
    setSearchParams(next);
    requestAnimationFrame(() => scrollToSection("workspaces"));
  }

  function focusInvitations() {
    navigate({ hash: "invitations" }, { replace: false });
    requestAnimationFrame(() => scrollToSection("invitations"));
  }

  function focusNotifications() {
    navigate({ hash: "notifications" }, { replace: false });
    requestAnimationFrame(() => scrollToSection("notifications"));
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <QuickAction
        icon={FolderPlus}
        iconClassName="bg-primary/15 text-primary"
        label="New workspace"
        helper="Create a shared workspace"
        onClick={onCreateWorkspace}
      />
      <QuickAction
        icon={Users}
        iconClassName="bg-secondary/15 text-secondary"
        label="Active workspaces"
        helper={`${activeCount} active`}
        onClick={focusActiveWorkspaces}
      />
      <QuickAction
        icon={Mail}
        iconClassName="bg-success/15 text-success"
        label="Review invitations"
        helper={
          pendingInvitationCount > 0
            ? `${pendingInvitationCount} pending`
            : "You're all caught up"
        }
        onClick={focusInvitations}
      />
      <QuickAction
        icon={Bell}
        iconClassName="bg-warning/15 text-warning"
        label="Notifications"
        helper={
          unreadNotificationCount > 0
            ? `${unreadNotificationCount} unread`
            : "You're all caught up"
        }
        onClick={focusNotifications}
      />
    </div>
  );
}
