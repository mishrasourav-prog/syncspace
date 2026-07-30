import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { useAuthStore } from "@/app/store";
import { cn } from "@/lib/utils";

interface MemberProfileLinkProps {
  userId: string;
  workspaceId?: string;
  projectId?: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function MemberProfileLink({
  userId,
  workspaceId,
  projectId,
  children,
  className,
  ariaLabel,
}: MemberProfileLinkProps) {
  const currentUserId = useAuthStore((state) => state.user?._id);
  const isSelf = Boolean(currentUserId) && userId === currentUserId;

  if (isSelf) {
    return (
      <Link
        to="/profile"
        aria-label={ariaLabel}
        className={cn(
          "rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          className,
        )}
      >
        {children}
      </Link>
    );
  }

  if (!workspaceId && !projectId) {
    return <>{children}</>;
  }

  const search = new URLSearchParams();

  if (workspaceId) {
    search.set("workspaceId", workspaceId);
  }

  if (projectId) {
    search.set("projectId", projectId);
  }

  return (
    <Link
      to={`/members/${userId}?${search.toString()}`}
      aria-label={ariaLabel}
      className={cn(
        "rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        className,
      )}
    >
      {children}
    </Link>
  );
}
