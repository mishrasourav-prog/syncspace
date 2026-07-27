import { useMemo, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Crown, UserMinus, UserPlus, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/app/store";
import { DashboardSectionError } from "@/features/workspaces/components/dashboard/DashboardSectionError";
import { formatDate } from "@/lib/date";
import { useProjectMembersQuery } from "../hooks/useProjectMemberQueries";
import { useUpdateProjectMemberRoleMutation } from "../hooks/useProjectMemberMutations";
import { RemoveProjectMemberDialog } from "./RemoveProjectMemberDialog";
import { getProjectAdminCount , isLastProjectAdmin } from "../../projects/project.permissions";
import { MemberProfileLink } from "@/features/profile/components/MemberProfileLink";
import type { ProjectMember, ProjectRole } from "../types/projectMember.types";

const INITIAL_VISIBLE = 6;
const ROLE_ORDER: Record<ProjectRole, number> = { admin: 0, member: 1 };

const roleBadgeVariant: Record<ProjectRole, "primary" | "neutral"> = {
  admin: "primary",
  member: "neutral",
};

function MemberRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-5 w-14 shrink-0 rounded-md" />
    </div>
  );
}

interface ProjectMembersPanelProps {
  workspaceId: string;
  projectId: string;
  search: string;
  canManage: boolean;
  canInvite: boolean;
  onInvite: () => void;
}

export function ProjectMembersPanel({
  workspaceId,
  projectId,
  search,
  canManage,
  canInvite,
  onInvite,
}: ProjectMembersPanelProps) {
  const currentUserId = useAuthStore((state) => state.user?._id);
  const membersQuery = useProjectMembersQuery(projectId);
  const updateRoleMutation = useUpdateProjectMemberRoleMutation(projectId);

  const [showAll, setShowAll] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<ProjectMember | null>(null);

  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);
  const adminCount = getProjectAdminCount(members);

  const sortedMembers = useMemo(
    () =>
      [...members].sort((a, b) => {
        const roleDiff = ROLE_ORDER[a.role] - ROLE_ORDER[b.role];
        if (roleDiff !== 0) return roleDiff;
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      }),
    [members]
  );

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sortedMembers;

    return sortedMembers.filter(
      (member) =>
        member.user.name.toLowerCase().includes(query) ||
        member.user.username.toLowerCase().includes(query) ||
        member.user.email.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)
    );
  }, [sortedMembers, search]);

  const visibleMembers = showAll ? filteredMembers : filteredMembers.slice(0, INITIAL_VISIBLE);
  const hasMore = filteredMembers.length > INITIAL_VISIBLE;

  function handleRoleChange(member: ProjectMember, role: ProjectRole) {
    if (role === member.role) return;

    updateRoleMutation.mutate(
      { memberId: member._id, role },
      {
        onSuccess: () => toast.success(`${member.user.name}'s role was changed to ${role}.`),
        onError: (error) => toast.error(error.message ?? "Unable to update role."),
      }
    );
  }

  return (
    <section
      id="members"
      aria-labelledby="project-members-heading"
      className="scroll-mt-24 rounded-xl border border-border bg-surface/60 p-4 shadow-soft"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="project-members-heading" className="text-h3 text-foreground">
          Members
          {!membersQuery.isLoading && !membersQuery.isError && (
            <span className="ml-2 text-caption">{filteredMembers.length}</span>
          )}
        </h2>
        {canInvite && (
          <Button size="sm" variant="secondary" onClick={onInvite}>
            <UserPlus className="h-3.5 w-3.5" />
            Invite
          </Button>
        )}
      </div>

      {membersQuery.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <MemberRowSkeleton key={index} />
          ))}
        </div>
      )}

      {membersQuery.isError && (
        <DashboardSectionError
          message={membersQuery.error?.message ?? "Unable to load members."}
          onRetry={() => membersQuery.refetch()}
        />
      )}

      {!membersQuery.isLoading && !membersQuery.isError && filteredMembers.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-8 text-center">
          <Users className="mx-auto h-6 w-6 text-muted" />
          <p className="mt-2 text-body">
            {members.length === 0 ? "No members yet." : "No members match your search."}
          </p>
        </div>
      )}

      {!membersQuery.isLoading && !membersQuery.isError && filteredMembers.length > 0 && (
        <div className="space-y-2">
          {visibleMembers.map((member) => {
            const isCurrentUser = member.user._id === currentUserId;
            const isOnlyAdmin = member.role === "admin" && isLastProjectAdmin(members, member.user._id);
            const showControls = canManage && !isCurrentUser && !isOnlyAdmin;
            const isUpdatingThis =
              updateRoleMutation.isPending && updateRoleMutation.variables?.memberId === member._id;

            return (
              <div
                key={member._id}
                className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:border-muted/40"
              >
                <MemberProfileLink
                  userId={member.user._id}
                  workspaceId={workspaceId}
                  projectId={projectId}
                  className="flex min-w-0 flex-1 items-center gap-3"
                  ariaLabel={`View ${member.user.name}'s profile`}
                >
                  <Avatar src={member.user.avatar} name={member.user.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
                      {member.role === "admin" && <Crown className="h-3 w-3 shrink-0 text-warning" aria-hidden />}
                      <span className="truncate">{member.user.name}</span>
                      {isCurrentUser && <span className="shrink-0 text-caption">(you)</span>}
                    </span>
                    <span className="block truncate text-caption">
                      {member.user.email} · Joined {formatDate(member.joinedAt)}
                    </span>
                  </span>
                </MemberProfileLink>

                {showControls ? (
                  <select
                    aria-label={`Change role for ${member.user.name}`}
                    value={member.role}
                    disabled={isUpdatingThis}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      handleRoleChange(member, event.target.value as ProjectRole)
                    }
                    className={cn(
                      "shrink-0 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground outline-none transition-colors focus:border-muted/60",
                      isUpdatingThis && "opacity-60"
                    )}
                  >
                    <option value="admin">admin</option>
                    <option value="member">member</option>
                  </select>
                ) : (
                  <Badge variant={roleBadgeVariant[member.role]}>
                    {isOnlyAdmin ? "Last admin" : member.role}
                  </Badge>
                )}

                {showControls && (
                  <button
                    type="button"
                    onClick={() => setRemoveTarget(member)}
                    aria-label={`Remove ${member.user.name} from project`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {hasMore && (
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="w-full rounded-lg py-2 text-center text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              {showAll ? "Show less" : `View all ${filteredMembers.length} members`}
            </button>
          )}
        </div>
      )}

      {adminCount > 0 && (
        <p className="mt-3 text-[11px] text-muted/70">
          {adminCount} admin{adminCount === 1 ? "" : "s"} on this project.
        </p>
      )}

      <RemoveProjectMemberDialog projectId={projectId} member={removeTarget} onClose={() => setRemoveTarget(null)} />
    </section>
  );
}
