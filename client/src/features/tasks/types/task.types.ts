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
}
