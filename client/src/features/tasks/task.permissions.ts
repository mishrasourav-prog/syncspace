import { canUpdateWorkItemStatus } from "@/features/projects/project.permissions";
import type { WorkspaceSummary } from "@/features/workspaces/types/workspace.types";
import type { Project } from "@/features/projects/types/project.types";
import type { ProjectRole } from "@/features/project-members/types/projectMember.types";
import type { Task } from "./types/task.types";

/** The parent workspace and project must both be active for any task mutation. */
function isWritable(project: Project, workspace: WorkspaceSummary): boolean {
  return !project.isArchived && !workspace.isArchived;
}

export function canChangeTaskStatus(
  task: Task,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined
): boolean {
  return !task.isArchived && canUpdateWorkItemStatus(project, workspace, role);
}

export function canEditTask(
  task: Task,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined
): boolean {
  return Boolean(role) && !task.isArchived && isWritable(project, workspace);
}

export function canManageTaskAssignees(
  task: Task,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined
): boolean {
  return Boolean(role) && !task.isArchived && isWritable(project, workspace);
}

/** Matches the server: project admin OR the task's own creator. */
export function canArchiveTask(
  task: Task,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
  currentUserId: string | undefined
): boolean {
  if (task.isArchived || !isWritable(project, workspace)) return false;
  return role === "admin" || (Boolean(currentUserId) && task.createdBy === currentUserId);
}

/** Matches the server: project admin OR the task's own creator. */
export function canRestoreTask(
  task: Task,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
  currentUserId: string | undefined
): boolean {
  if (!task.isArchived || !isWritable(project, workspace)) return false;
  return role === "admin" || (Boolean(currentUserId) && task.createdBy === currentUserId);
}

export interface TaskBoardFilterState {
  search: string;
  status: string[];
  type: string[];
  priority: string[];
  assignee: string | null;
  due: string | null;
  state: string;
}

/**
 * The reorder endpoint requires complete, unfiltered active-root columns.
 * Dragging must be disabled whenever a filter could hide a task the
 * request would otherwise need to include, or when the board isn't
 * showing exactly the active task set (e.g. state=archived/all).
 */
export function canReorderTaskBoard(
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
  filters: TaskBoardFilterState,
  taskCountByColumn: Record<string, number>
): boolean {
  if (!role || !isWritable(project, workspace)) return false;
  if (filters.state !== "active") return false;

  const hasActiveFilter =
    Boolean(filters.search.trim()) ||
    filters.status.length > 0 ||
    filters.type.length > 0 ||
    filters.priority.length > 0 ||
    Boolean(filters.assignee) ||
    Boolean(filters.due);

  if (hasActiveFilter) return false;

  return Object.values(taskCountByColumn).every((count) => count <= 500);
}
