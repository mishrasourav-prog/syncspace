import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Archive, ArchiveRestore, Clock, LogOut, MoreVertical, Pencil } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime } from "@/lib/date";
import type { WorkspaceSummary } from "../types/workspace.types";
import {
  canArchiveWorkspace,
  canEditWorkspace,
  canLeaveWorkspace,
  canRestoreWorkspace,
} from "../workspace.permissions";

const roleBadgeVariant: Record<WorkspaceSummary["role"], "primary" | "secondary" | "neutral"> = {
  owner: "primary",
  admin: "secondary",
  member: "neutral",
  guest: "neutral",
};

interface WorkspaceCardProps {
  workspace: WorkspaceSummary;
  onEdit: (workspace: WorkspaceSummary) => void;
  onArchive: (workspace: WorkspaceSummary) => void;
  onRestore: (workspace: WorkspaceSummary) => void;
  onLeave: (workspace: WorkspaceSummary) => void;
}

export function WorkspaceCard({ workspace, onEdit, onArchive, onRestore, onLeave }: WorkspaceCardProps) {
  const navigate = useNavigate();

  const showEdit = canEditWorkspace(workspace);
  const showArchive = canArchiveWorkspace(workspace);
  const showRestore = canRestoreWorkspace(workspace);
  const showLeave = canLeaveWorkspace(workspace);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="group flex flex-col rounded-xl border border-border bg-surface/60 p-4 shadow-soft transition-colors hover:border-muted/40"
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate(`/workspaces/${workspace._id}`)}
          className="flex min-w-0 items-center gap-3 text-left"
        >
          <Avatar src={workspace.avatar} name={workspace.name} size="md" square />
          <div className="min-w-0">
            <p className="truncate text-h3 text-foreground">{workspace.name}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <Badge variant={roleBadgeVariant[workspace.role]}>{workspace.role}</Badge>
              {workspace.isArchived && <Badge variant="warning">Archived</Badge>}
            </div>
          </div>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger aria-label={`Actions for ${workspace.name}`}>
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => navigate(`/workspaces/${workspace._id}`)}>
              Open {workspace.isArchived ? "(read-only)" : "workspace"}
            </DropdownMenuItem>
            {showEdit && (
              <DropdownMenuItem onClick={() => onEdit(workspace)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit workspace
              </DropdownMenuItem>
            )}
            {showArchive && (
              <DropdownMenuItem variant="danger" onClick={() => onArchive(workspace)}>
                <Archive className="h-3.5 w-3.5" />
                Archive workspace
              </DropdownMenuItem>
            )}
            {showRestore && (
              <DropdownMenuItem onClick={() => onRestore(workspace)}>
                <ArchiveRestore className="h-3.5 w-3.5" />
                Restore workspace
              </DropdownMenuItem>
            )}
            {showLeave && (
              <DropdownMenuItem variant="danger" onClick={() => onLeave(workspace)}>
                <LogOut className="h-3.5 w-3.5" />
                Leave workspace
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-body">
        {workspace.description || "No description provided."}
      </p>

      <div className="mt-4 flex items-center justify-between text-caption">
        <span className="truncate">{workspace.timezone}</span>
        <span className="flex shrink-0 items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatRelativeTime(workspace.updatedAt)}
        </span>
      </div>
    </motion.div>
  );
}
