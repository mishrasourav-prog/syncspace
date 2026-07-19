import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Crown, UserMinus, UserPlus, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/app/store";
import { DashboardSectionError } from "@/features/workspaces/components/dashboard/DashboardSectionError";
import { canInviteWorkspaceMember, canManageWorkspaceMembers } from "@/features/workspaces/workspace.permissions";
import type { WorkspaceSummary } from "@/features/workspaces/types/workspace.types";
import { useWorkspaceMembersQuery } from "../hooks/useWorkspaceMemberQueries";
import { useUpdateWorkspaceMemberRoleMutation } from "../hooks/useWorkspaceMemberMutations";
import { RemoveWorkspaceMemberDialog } from "./RemoveWorkspaceMemberDialog";
import type { AssignableWorkspaceRole, WorkspaceMember } from "../types/workspaceMember.types";

const INITIAL_VISIBLE = 5;
const ROLE_ORDER: Record<string, number> = { owner: 0, admin: 1, member: 2, guest: 3 };
const ASSIGNABLE_ROLES: AssignableWorkspaceRole[] = ["admin", "member", "guest"];

const roleBadgeVariant: Record<string, "primary" | "secondary" | "neutral"> = {
  owner: "primary",
  admin: "secondary",
  member: "neutral",
  guest: "neutral",
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

interface WorkspaceMembersPanelProps {
  workspace: WorkspaceSummary;
  search: string;
  onInvite: () => void;
}

export function WorkspaceMembersPanel({ workspace, search, onInvite }: WorkspaceMembersPanelProps) {
  const currentUserId = useAuthStore((state) => state.user?._id);
  const membersQuery = useWorkspaceMembersQuery(workspace._id);
  const updateRoleMutation = useUpdateWorkspaceMemberRoleMutation(workspace._id);

  const [showAll, setShowAll] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<WorkspaceMember | null>(null);

  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);
  const canManage = canManageWorkspaceMembers(workspace);
  const canInvite = canInviteWorkspaceMember(workspace);

  const sortedMembers = useMemo(
    () =>
      [...members].sort((a, b) => {
        const roleDiff = (ROLE_ORDER[a.role] ?? 99) - (ROLE_ORDER[b.role] ?? 99);
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

 function handleRoleChange(
    member:
        WorkspaceMember,

    role:
        AssignableWorkspaceRole
): void {
    if (
        role ===
        member.role
    ) {
        return;
    }

    updateRoleMutation.mutate(
        {
            memberId:
                member._id,

            role,
        },
        {
            onSuccess:
                () => {
                    toast.success(
                        `${member.user.name}'s role was changed to ${role}.`
                    );
                },

            onError:
                (
                    error
                ) => {
                    toast.error(
                        error.message ||
                        "Unable to update the member role."
                    );
                },
        }
    );
}
  return (
    <section
      id="members"
      aria-labelledby="members-panel-heading"
      className="scroll-mt-24 rounded-xl border border-border bg-surface/60 p-4 shadow-soft"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="members-panel-heading" className="text-h3 text-foreground">
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
            const isOwner = member.role === "owner";

            return (
              <div
                key={member._id}
                className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:border-muted/40"
              >
                <Avatar src={member.user.avatar} name={member.user.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
                    {isOwner && <Crown className="h-3 w-3 shrink-0 text-warning" aria-hidden />}
                    <span className="truncate">{member.user.name}</span>
                    {isCurrentUser && <span className="shrink-0 text-caption">(you)</span>}
                  </p>
                  <p className="truncate text-caption">{member.user.email}</p>
                </div>

                {canManage && !isOwner ? (
                  <select
    aria-label={
        `Change role for ${member.user.name}`
    }
    value={
        member.role
    }
    disabled={
        updateRoleMutation
            .isPending
    }
    onChange={
        (
            event
        ) =>
            handleRoleChange(
                member,
                event.target
                    .value as AssignableWorkspaceRole
            )
    }
    className={cn(
        `
        shrink-0
        rounded-md
        border
        border-border
        bg-background
        px-2
        py-1
        text-xs
        text-foreground
        outline-none
        transition-colors
        focus:border-muted/60
        `,

        updateRoleMutation
            .isPending &&
            "cursor-not-allowed opacity-60"
    )}
>
    {
        ASSIGNABLE_ROLES.map(
            (
                role
            ) => (
                <option
                    key={
                        role
                    }
                    value={
                        role
                    }
                >
                    {role}
                </option>
            )
        )
    }
</select>
                ) : (
                  <Badge variant={roleBadgeVariant[member.role]}>{member.role}</Badge>
                )}

                {canManage && !isOwner && (
                  <button
                    type="button"
                    onClick={() => setRemoveTarget(member)}
                    aria-label={`Remove ${member.user.name} from workspace`}
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

      <RemoveWorkspaceMemberDialog
        workspaceId={workspace._id}
        member={removeTarget}
        onClose={() => setRemoveTarget(null)}
      />
    </section>
  );
}
