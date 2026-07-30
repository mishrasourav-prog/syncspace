import {
  Archive,
  Calendar,
  Clock,
  Globe2,
  LogOut,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  UserPlus,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, formatRelativeTime } from "@/lib/date";
import {
  canArchiveWorkspace,
  canEditWorkspace,
  canInviteWorkspaceMember,
  canLeaveWorkspace,
  canRestoreWorkspace,
} from "../../workspace.permissions";
import type { WorkspaceSummary } from "../../types/workspace.types";

const roleBadgeVariant: Record<string, "primary" | "secondary" | "neutral"> = {
  owner: "primary",
  admin: "secondary",
  member: "neutral",
  guest: "neutral",
};

interface WorkspaceHeaderProps {
  workspace: WorkspaceSummary;
  onInvite: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onLeave: () => void;
}

export function WorkspaceHeader({
  workspace,
  onInvite,
  onEdit,
  onArchive,
  onRestore,
  onLeave,
}: WorkspaceHeaderProps) {
  const showInvite = canInviteWorkspaceMember(workspace);
  const showEdit = canEditWorkspace(workspace);
  const showArchive = canArchiveWorkspace(workspace);
  const showRestore = canRestoreWorkspace(workspace);
  const showLeave = canLeaveWorkspace(workspace);
  const hasOverflowActions = showArchive || showRestore || showLeave;

  return (
    <div className="rounded-xl border border-border bg-surface/60 p-5 shadow-soft sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar
            src={workspace.avatar}
            name={workspace.name}
            size="xl"
            square
            className="bg-gradient-to-br from-primary to-secondary text-white"
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-h1 text-foreground">{workspace.name}</h1>
              <Badge variant={roleBadgeVariant[workspace.role]}>
                {workspace.role}
              </Badge>
              <Badge variant={workspace.isArchived ? "warning" : "success"}>
                {workspace.isArchived ? "Archived" : "Active"}
              </Badge>
            </div>

            <p className="mt-2 max-w-2xl text-body">
              {workspace.description || "No description provided."}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-caption">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Created on {formatDate(workspace.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5" />
                {workspace.timezone}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Updated {formatRelativeTime(workspace.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showInvite && (
            <Button variant="secondary" size="sm" onClick={onInvite}>
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Invite Members</span>
              <span className="sm:hidden">Invite</span>
            </Button>
          )}

          {showEdit && (
            <Button size="sm" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit Workspace</span>
              <span className="sm:hidden">Edit</span>
            </Button>
          )}

          {hasOverflowActions && (
            <DropdownMenu>
              <DropdownMenuTrigger aria-label="More workspace actions">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {showArchive && (
                  <DropdownMenuItem variant="danger" onClick={onArchive}>
                    <Archive className="h-3.5 w-3.5" />
                    Archive workspace
                  </DropdownMenuItem>
                )}
                {showRestore && (
                  <DropdownMenuItem onClick={onRestore}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore workspace
                  </DropdownMenuItem>
                )}
                {showLeave && (
                  <DropdownMenuItem variant="danger" onClick={onLeave}>
                    <LogOut className="h-3.5 w-3.5" />
                    Leave workspace
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
