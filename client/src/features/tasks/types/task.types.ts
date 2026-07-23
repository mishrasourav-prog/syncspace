export type TaskType = "task" | "issue";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface TaskAssigneePreview {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface Task {
  _id: string;
  project: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdBy: string;
  updatedBy?: string;
  completedBy?: string;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  type: TaskType;
  parentTask?: string;
  position: number;
  assignees: TaskAssigneePreview[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  type?: TaskType;
  priority?: TaskPriority;
  startDate?: string;
  dueDate?: string;
  /** Present only when creating a subtask from the Task Detail page. */
  parentTask?: string;
}

/**
 * Every field is optional — quick edit sends only what changed. Dates that
 * were cleared in the form are simply omitted, never sent as null, since
 * the server's update-task validator does not accept null.
 */
export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  type?: TaskType;
  priority?: TaskPriority;
  startDate?: string;
  dueDate?: string;
}

export interface ReorderTasksColumn {
  status: TaskStatus;
  taskIds: string[];
}

export interface ReorderTasksPayload {
  columns: ReorderTasksColumn[];
}

export interface ReorderTasksResult {
  updatedTaskCount: number;
}
