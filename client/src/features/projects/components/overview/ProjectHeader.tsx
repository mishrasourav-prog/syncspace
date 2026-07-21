import { Archive, Calendar, FolderKanban, MoreHorizontal, Pencil, RotateCcw, LogOut, UserPlus, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/app/store";
import { formatDate } from "@/lib/date";
import type { WorkspaceSummary } from "@/features/workspaces/types/workspace.types";
import type { ProjectMember, ProjectRole } from "@/features/project-members/types/projectMember.types";
import {
  canArchiveProject,
  canEditProject,
  canInviteProjectMember,
  canLeaveProject,
  canRestoreProject,
} from "../../project.permissions";
import type { Project } from "../../types/project.types";

const roleBadgeVariant: Record<ProjectRole, "primary" | "neutral"> = {
  admin: "primary",
  member: "neutral",
};

interface ProjectHeaderProps {
  project: Project;
  workspace: WorkspaceSummary;
  role: ProjectRole | undefined;
  members: ProjectMember[];
  onInvite: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onLeave: () => void;
}

export function ProjectHeader({ project, workspace, role, members, onInvite, onEdit, onArchive, onRestore, onLeave }: ProjectHeaderProps) {
  const currentUserId = useAuthStore((state) => state.user?._id);
  const showInvite = canInviteProjectMember(project, workspace, role);
  const showEdit = canEditProject(project, workspace, role);
  const showArchive = canArchiveProject(project, workspace, role);
  const showRestore = canRestoreProject(project, workspace, role);
  const showLeave = canLeaveProject(project, workspace, role, members, currentUserId);
  const hasOverflowActions = showArchive || showRestore || showLeave;

  const previewMembers = members.slice(0, 5);
  const overflowCount = Math.max(0, members.length - previewMembers.length);

  return (
    <div className="rounded-xl border border-border bg-surface/60 p-5 shadow-soft sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-2xl text-white sm:h-[72px] sm:w-[72px]">
            {project.icon || <FolderKanban className="h-7 w-7" />}
          </span>

          <div className="min-w-0">
            <p className="text-caption uppercase tracking-wide">Project</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h1 className="text-h1 text-foreground">{project.name}</h1>
              {role && <Badge variant={roleBadgeVariant[role]}>{role}</Badge>}
              <Badge variant={project.isArchived ? "warning" : "success"}>
                {project.isArchived ? "Archived" : "Active"}
              </Badge>
            </div>

            <p className="mt-2 max-w-2xl text-body">{project.description || "No description provided."}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-caption">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Created on {formatDate(project.createdAt)}
              </span>
              {members.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {members.length} member{members.length === 1 ? "" : "s"}
                </span>
              )}
            </div>

            {previewMembers.length > 0 && (
              <div className="mt-3 flex items-center -space-x-1.5">
                {previewMembers.map((member) => (
                  <Avatar
                    key={member._id}
                    src={member.user.avatar}
                    name={member.user.name}
                    size="sm"
                    className="ring-2 ring-surface"
                  />
                ))}
                {overflowCount > 0 && (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-border/60 text-[10px] font-medium text-foreground ring-2 ring-surface">
                    +{overflowCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showInvite && (
            <Button variant="secondary" size="sm" onClick={onInvite}>
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Invite</span>
            </Button>
          )}

          {showEdit && (
            <Button size="sm" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit Project</span>
              <span className="sm:hidden">Edit</span>
            </Button>
          )}

          {hasOverflowActions && (
            <DropdownMenu>
              <DropdownMenuTrigger aria-label="More project actions">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {showArchive && (
                  <DropdownMenuItem variant="danger" onClick={onArchive}>
                    <Archive className="h-3.5 w-3.5" />
                    Archive project
                  </DropdownMenuItem>
                )}
                {showRestore && (
                  <DropdownMenuItem onClick={onRestore}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore project
                  </DropdownMenuItem>
                )}
                {showLeave && (
                  <DropdownMenuItem variant="danger" onClick={onLeave}>
                    <LogOut className="h-3.5 w-3.5" />
                    Leave project
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
