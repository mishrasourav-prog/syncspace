import { Link } from "react-router-dom";
import { Crown } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProjectMember } from "@/features/project-members/types/projectMember.types";

const VISIBLE_AVATARS = 6;

interface DocumentProjectMembersPanelProps {
  members: ProjectMember[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  workspaceId: string;
  projectId: string;
  canInvite: boolean;
  onInvite: () => void;
}

export function DocumentProjectMembersPanel({
  members,
  isLoading,
  isError,
  onRetry,
  workspaceId,
  projectId,
  canInvite,
  onInvite,
}: DocumentProjectMembersPanelProps) {
  const visible = members.slice(0, VISIBLE_AVATARS);
  const overflow = members.length - visible.length;

  return (
    <section className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-h3 text-foreground">Project members</h2>
        <span className="text-caption">{isLoading ? "…" : members.length}</span>
      </div>

      <p className="mb-3 text-[11px] text-muted/80">
        Project members can edit this document. Concurrent saves are protected
        by revision checks.
      </p>

      {isLoading && (
        <div className="flex -space-x-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-8 w-8 rounded-full ring-2 ring-surface"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <span>Unable to load project members.</span>
          <button
            type="button"
            onClick={onRetry}
            className="font-medium text-primary hover:text-primary/80"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div className="flex -space-x-2">
            {visible.map((member) => (
              <div
                key={member._id}
                className="relative"
                title={`${member.user.name} · ${member.role}`}
              >
                <Avatar
                  src={member.user.avatar}
                  name={member.user.name}
                  size="sm"
                  className="ring-2 ring-surface"
                />
                {member.role === "admin" && (
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-surface">
                    <Crown className="h-2 w-2" />
                  </span>
                )}
              </div>
            ))}
            {overflow > 0 && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-border/60 text-[10px] font-medium text-foreground ring-2 ring-surface">
                +{overflow}
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <Link
              to={`/workspaces/${workspaceId}/projects/${projectId}#members`}
              className="font-medium text-primary hover:text-primary/80"
            >
              View project members
            </Link>
            {canInvite && (
              <button
                type="button"
                onClick={onInvite}
                className="font-medium text-primary hover:text-primary/80"
              >
                Invite project member
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
