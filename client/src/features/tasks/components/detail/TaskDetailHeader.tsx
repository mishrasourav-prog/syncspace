import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckSquare, Copy, MoreHorizontal, Pencil, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Task } from "../../types/task.types";
import { TaskDetailMetadata } from "./TaskDetailMetadata";

interface TaskDetailHeaderProps {
  task: Task;
  canEdit: boolean;
  canChangeStatus: boolean;
  canManageAssignees: boolean;
  canArchive: boolean;
  canRestore: boolean;
  isUpdatingStatus: boolean;
  onEdit: () => void;
  onManageAssignees: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onStatusChange: (status: Task["status"]) => void;
}

function shortTaskId(id: string): string {
  return id.length > 10 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
}

export function TaskDetailHeader({
  task,
  canEdit,
  canChangeStatus,
  canManageAssignees,
  canArchive,
  canRestore,
  isUpdatingStatus,
  onEdit,
  onManageAssignees,
  onArchive,
  onRestore,
  onStatusChange,
}: TaskDetailHeaderProps) {
  const [copied, setCopied] = useState(false);
  const TypeIcon = task.type === "issue" ? AlertCircle : CheckSquare;

  async function handleCopyId() {
    try {
      await navigator.clipboard.writeText(task._id);
      setCopied(true);
      toast.success("Task ID copied.");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Unable to copy the task ID.");
    }
  }

  const descriptionPreview = task.description.trim();

  return (
    <section className="rounded-xl border border-border bg-surface/60 p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={task.type === "issue" ? "primary" : "secondary"} className="gap-1">
              <TypeIcon className="h-3 w-3" />
              {task.type === "issue" ? "ISSUE" : "TASK"}
            </Badge>
            {task.isArchived && <Badge variant="warning">Archived</Badge>}
          </div>

          <h1 className="text-h1 break-words text-foreground">{task.title}</h1>

          {descriptionPreview && (
            <p className="line-clamp-2 text-sm text-muted">{descriptionPreview}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {canEdit && (
            <Button size="sm" variant="secondary" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger aria-label="More task actions" className="border border-border">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {canEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit task
                </DropdownMenuItem>
              )}
              {canManageAssignees && (
                <DropdownMenuItem onClick={onManageAssignees}>
                  <Users className="h-3.5 w-3.5" />
                  Manage assignees
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleCopyId}>
                <Copy className="h-3.5 w-3.5" />
                {copied ? "Copied!" : `Copy task ID (${shortTaskId(task._id)})`}
              </DropdownMenuItem>
              {canArchive && (
                <DropdownMenuItem variant="danger" onClick={onArchive}>
                  Archive
                </DropdownMenuItem>
              )}
              {canRestore && <DropdownMenuItem onClick={onRestore}>Restore</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-5">
        <TaskDetailMetadata
          task={task}
          canEditMetadata={canEdit}
          canChangeStatus={canChangeStatus}
          isUpdatingStatus={isUpdatingStatus}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
        />
      </div>
    </section>
  );
}
