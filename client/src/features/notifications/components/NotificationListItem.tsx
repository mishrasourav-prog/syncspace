import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDateTime, formatRelativeTime } from "@/lib/date";
import { getNotificationActorName } from "../notification.display";
import { getNotificationSupplementalText } from "../notification.metadata";
import { NotificationTypeIcon } from "./NotificationTypeIcon";
import type { NotificationItem } from "../notification.types";

interface NotificationListItemProps {
  notification: NotificationItem;
  isSelected: boolean;
  onSelect: () => void;
}

export function NotificationListItem({ notification, isSelected, onSelect }: NotificationListItemProps) {
  const actorName = getNotificationActorName(notification);
  const supplemental = getNotificationSupplementalText(notification);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isSelected ? "true" : undefined}
      className={cn(
        "flex w-full gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-border/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset",
        isSelected && "bg-primary/10 border-l-2 border-l-primary",
        !notification.isRead && !isSelected && "bg-primary/5"
      )}
    >
      {notification.actor ? (
        <Avatar src={notification.actor.avatar} name={actorName} size="sm" />
      ) : (
        <NotificationTypeIcon type={notification.type} />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium text-foreground">{notification.title}</p>
          {!notification.isRead && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted">{notification.message}</p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted/70">
          <span>{actorName}</span>
          {supplemental && (
            <>
              <span aria-hidden>·</span>
              <span className="truncate">{supplemental}</span>
            </>
          )}
          <span aria-hidden>·</span>
          <time dateTime={notification.createdAt} title={formatDateTime(notification.createdAt)}>
            {formatRelativeTime(notification.createdAt)}
          </time>
        </div>
      </div>
    </button>
  );
}
