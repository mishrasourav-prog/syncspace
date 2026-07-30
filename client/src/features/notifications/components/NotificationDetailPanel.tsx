import { AlertCircle, CheckCheck, ExternalLink, RefreshCw } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatRelativeTime } from "@/lib/date";
import { useWorkspaceQuery } from "@/features/workspaces/hooks/useWorkspaceQueries";
import { useProjectQuery } from "@/features/projects/hooks/useProjectQueries";
import {
  getNotificationActorName,
  getNotificationTypeLabel,
} from "../notification.display";
import { getNotificationSupplementalText } from "../notification.metadata";
import { getNotificationDestination } from "../notification.navigation";
import { NotificationTypeIcon } from "./NotificationTypeIcon";
import type { NotificationItem } from "../notification.types";

interface NotificationDetailPanelProps {
  notification: NotificationItem | null;
  onMarkAsRead: (id: string) => void;
  isMarkingAsRead: boolean;
  onNavigate: (path: string) => void;
}

function isUnavailableStatus(status: number | undefined): boolean {
  return status === 403 || status === 404;
}

export function NotificationDetailPanel({
  notification,
  onMarkAsRead,
  isMarkingAsRead,
  onNavigate,
}: NotificationDetailPanelProps) {
  const destination = notification
    ? getNotificationDestination(notification)
    : null;
  const shouldVerifyResourceAccess = Boolean(
    destination?.requiresResourceAccess,
  );
  const workspaceQuery = useWorkspaceQuery(
    shouldVerifyResourceAccess
      ? (notification?.workspace ?? undefined)
      : undefined,
  );
  const projectQuery = useProjectQuery(
    shouldVerifyResourceAccess
      ? (notification?.project ?? undefined)
      : undefined,
  );

  if (!notification) {
    return (
      <aside
        aria-label="Notification details"
        className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-border bg-surface/60 p-6 text-center shadow-soft"
      >
        <p className="text-body">Select a notification to see its details.</p>
      </aside>
    );
  }

  const actorName = getNotificationActorName(notification);
  const supplemental = getNotificationSupplementalText(notification);

  const workspaceLoading =
    shouldVerifyResourceAccess &&
    Boolean(notification.workspace) &&
    workspaceQuery.isLoading;
  const projectLoading =
    shouldVerifyResourceAccess &&
    Boolean(notification.project) &&
    projectQuery.isLoading;
  const relatedContextLoading = workspaceLoading || projectLoading;

  const workspaceUnavailable =
    shouldVerifyResourceAccess &&
    Boolean(notification.workspace) &&
    workspaceQuery.isError &&
    isUnavailableStatus(workspaceQuery.error?.status);
  const projectUnavailable =
    shouldVerifyResourceAccess &&
    Boolean(notification.project) &&
    projectQuery.isError &&
    isUnavailableStatus(projectQuery.error?.status);
  const workspaceContextFailed =
    Boolean(notification.workspace) &&
    workspaceQuery.isError &&
    !workspaceUnavailable;
  const projectContextFailed =
    Boolean(notification.project) &&
    projectQuery.isError &&
    !projectUnavailable;
  const projectWorkspaceMismatch = Boolean(
    notification.workspace &&
    projectQuery.data &&
    projectQuery.data.workspace !== notification.workspace,
  );

  const relatedResourceUnavailable =
    workspaceUnavailable || projectUnavailable || projectWorkspaceMismatch;
  const relatedContextFailed = workspaceContextFailed || projectContextFailed;
  const canOpenRelated = Boolean(
    destination &&
    (!destination.requiresResourceAccess ||
      (!relatedContextLoading &&
        !relatedResourceUnavailable &&
        !relatedContextFailed)),
  );

  function handleOpenRelated() {
    if (!destination || !canOpenRelated) return;

    if (!notification) return;

    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }

    onNavigate(destination.path);
  }

  return (
    <aside
      aria-label="Notification details"
      className="flex flex-col gap-4 rounded-xl border border-border bg-surface/60 p-4 shadow-soft xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto"
    >
      <div className="flex items-start gap-3">
        {notification.actor ? (
          <Avatar src={notification.actor.avatar} name={actorName} size="md" />
        ) : (
          <NotificationTypeIcon type={notification.type} className="h-9 w-9" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-h3 text-foreground">{notification.title}</p>
          <p className="text-caption">
            {getNotificationTypeLabel(notification)}
          </p>
        </div>
        {!notification.isRead && (
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary">
            <span className="sr-only">Unread notification</span>
          </span>
        )}
      </div>

      <p className="whitespace-pre-wrap text-body">{notification.message}</p>

      <dl className="space-y-2 rounded-lg border border-border/70 bg-background/40 p-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-caption">Created</dt>
          <dd
            className="truncate text-right text-foreground"
            title={formatDateTime(notification.createdAt)}
          >
            {formatRelativeTime(notification.createdAt)}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-2">
          <dt className="text-caption">Status</dt>
          <dd className="text-right text-foreground">
            {notification.isRead ? "Read" : "Unread"}
            {notification.isRead && notification.readAt && (
              <span
                className="ml-1 text-caption"
                title={formatDateTime(notification.readAt)}
              >
                ({formatRelativeTime(notification.readAt)})
              </span>
            )}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-2">
          <dt className="text-caption">From</dt>
          <dd className="truncate text-right text-foreground">{actorName}</dd>
        </div>

        {shouldVerifyResourceAccess && notification.workspace && (
          <div className="flex items-center justify-between gap-2">
            <dt className="text-caption">Workspace</dt>
            <dd className="min-w-0 text-right text-foreground">
              {workspaceQuery.isLoading ? (
                <Skeleton className="ml-auto h-3.5 w-20" />
              ) : workspaceUnavailable ? (
                <span className="text-muted">Unavailable workspace</span>
              ) : workspaceContextFailed ? (
                <button
                  type="button"
                  onClick={() => workspaceQuery.refetch()}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </button>
              ) : (
                <span className="block truncate">
                  {workspaceQuery.data?.name ?? "—"}
                </span>
              )}
            </dd>
          </div>
        )}

        {shouldVerifyResourceAccess && notification.project && (
          <div className="flex items-center justify-between gap-2">
            <dt className="text-caption">Project</dt>
            <dd className="min-w-0 text-right text-foreground">
              {projectQuery.isLoading ? (
                <Skeleton className="ml-auto h-3.5 w-20" />
              ) : projectUnavailable || projectWorkspaceMismatch ? (
                <span className="text-muted">Unavailable project</span>
              ) : projectContextFailed ? (
                <button
                  type="button"
                  onClick={() => projectQuery.refetch()}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </button>
              ) : (
                <span className="block truncate">
                  {projectQuery.data?.name ?? "—"}
                </span>
              )}
            </dd>
          </div>
        )}

        {supplemental && (
          <div className="flex items-center justify-between gap-2">
            <dt className="text-caption">Details</dt>
            <dd className="truncate text-right text-foreground">
              {supplemental}
            </dd>
          </div>
        )}
      </dl>

      {relatedContextLoading && destination && (
        <p className="text-caption text-muted">
          Checking access to the related item…
        </p>
      )}

      {relatedResourceUnavailable && (
        <p className="flex items-start gap-1.5 text-caption text-muted">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          You may no longer have access to this item.
        </p>
      )}

      {relatedContextFailed && (
        <p className="flex items-start gap-1.5 text-caption text-muted">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Related project information could not be verified. Retry the failed
          context above.
        </p>
      )}

      <div className="mt-auto flex flex-col gap-2">
        {destination && (
          <Button
            size="sm"
            onClick={handleOpenRelated}
            disabled={!canOpenRelated}
          >
            <ExternalLink className="h-4 w-4" />
            {relatedContextLoading ? "Checking access…" : destination.label}
          </Button>
        )}

        {!notification.isRead ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onMarkAsRead(notification._id)}
            disabled={isMarkingAsRead}
          >
            <CheckCheck className="h-4 w-4" />
            {isMarkingAsRead ? "Marking as read…" : "Mark as read"}
          </Button>
        ) : (
          <p className="flex items-center gap-1.5 text-caption">
            <CheckCheck className="h-3.5 w-3.5" />
            Read
          </p>
        )}
      </div>
    </aside>
  );
}
