import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/date";
import {
  useNotificationsQuery,
  useUnreadNotificationCountQuery,
} from "../hooks/useNotificationQueries";
import {
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
} from "../hooks/useNotificationMutations";
import { getNotificationDestination } from "../notification.navigation";

export function NotificationCenter() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const unreadCountQuery = useUnreadNotificationCountQuery();
  const notificationsQuery = useNotificationsQuery(open);
  const markOneReadMutation = useMarkNotificationAsReadMutation();
  const markAllReadMutation = useMarkAllNotificationsAsReadMutation();

  const unreadCount = unreadCountQuery.data ?? 0;
  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const notifications = notificationsQuery.data ?? [];

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-border/40 hover:text-foreground"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {badgeLabel}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-3 top-16 z-40 max-h-[70vh] overflow-hidden rounded-xl border border-border bg-surface shadow-elevated sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-96"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-h3 text-foreground">Notifications</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                  className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80 disabled:opacity-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[55vh] overflow-y-auto">
              {notificationsQuery.isLoading && (
                <div className="px-4 py-8 text-center text-caption">
                  Loading notifications...
                </div>
              )}

              {notificationsQuery.isError && (
                <div className="px-4 py-8 text-center text-caption text-danger">
                  {notificationsQuery.error?.message ??
                    "Unable to load notifications."}
                </div>
              )}

              {!notificationsQuery.isLoading &&
                !notificationsQuery.isError &&
                notifications.length === 0 && (
                  <div className="px-4 py-8 text-center text-caption">
                    You&apos;re all caught up.
                  </div>
                )}

              {notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => {
                    if (!notification.isRead) {
                      markOneReadMutation.mutate(notification._id);
                    }

                    const destination =
                      getNotificationDestination(notification);
                    setOpen(false);
                    navigate(destination?.path ?? "/notifications");
                  }}
                  className={cn(
                    "flex w-full gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-border/20",
                    !notification.isRead && "bg-primary/5",
                  )}
                >
                  <Avatar
                    src={notification.actor?.avatar}
                    name={notification.actor?.name ?? notification.title}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-[11px] text-muted/70">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-border px-4 py-2.5 text-center">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate("/notifications");
                }}
                className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
