import type {
  Task,
  TaskPriority,
  TaskStatus,
  TaskType,
} from "./types/task.types";

export type TaskView = "board" | "list";
export type TaskStateFilter = "active" | "archived" | "all";
export type TaskDueFilter = "overdue" | "today" | "week" | "none";

export const ALL_STATUSES: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
];
export const ALL_TYPES: TaskType[] = ["task", "issue"];
export const ALL_PRIORITIES: TaskPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

export const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const TYPE_LABEL: Record<TaskType, string> = {
  task: "Task",
  issue: "Issue",
};

export interface TaskFilters {
  view: TaskView;
  q: string;
  status: TaskStatus[];
  type: TaskType[];
  priority: TaskPriority[];
  assignee: string | null;
  due: TaskDueFilter | null;
  state: TaskStateFilter;
}

function parseCsv<T extends string>(
  value: string | null,
  allowed: readonly T[],
): T[] {
  if (!value) return [];
  const set = new Set(allowed as readonly string[]);
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => set.has(entry)) as T[];
}

export function parseTaskFilters(searchParams: URLSearchParams): TaskFilters {
  const view = searchParams.get("view") === "list" ? "list" : "board";
  const stateParam = searchParams.get("state");
  const state: TaskStateFilter =
    stateParam === "archived" || stateParam === "all" ? stateParam : "active";
  const dueParam = searchParams.get("due");
  const due: TaskDueFilter | null =
    dueParam === "overdue" ||
    dueParam === "today" ||
    dueParam === "week" ||
    dueParam === "none"
      ? dueParam
      : null;

  return {
    view,
    q: searchParams.get("q") ?? "",
    status: parseCsv(searchParams.get("status"), ALL_STATUSES),
    type: parseCsv(searchParams.get("type"), ALL_TYPES),
    priority: parseCsv(searchParams.get("priority"), ALL_PRIORITIES),
    assignee: searchParams.get("assignee"),
    due,
    state,
  };
}

export function countActiveFilters(filters: TaskFilters): number {
  let count = 0;
  if (filters.status.length > 0) count += 1;
  if (filters.type.length > 0) count += 1;
  if (filters.priority.length > 0) count += 1;
  if (filters.assignee) count += 1;
  if (filters.due) count += 1;
  if (filters.state !== "active") count += 1;
  return count;
}

export function hasNonSearchFilters(filters: TaskFilters): boolean {
  return (
    filters.status.length > 0 ||
    filters.type.length > 0 ||
    filters.priority.length > 0 ||
    Boolean(filters.assignee) ||
    Boolean(filters.due)
  );
}

function getLocalCalendarDay(value: string): Date {
  const datePart = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);

    return new Date(year, month, day);
  }

  const parsed = new Date(value);

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function isOverdue(task: Task, now: number): boolean {
  if (!task.dueDate || task.status === "DONE") return false;

  const due = getLocalCalendarDay(task.dueDate);
  const endOfDueDay = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate() + 1,
  ).getTime();

  return endOfDueDay <= now;
}

function isDueToday(task: Task, now: number): boolean {
  if (!task.dueDate || task.status === "DONE") return false;

  const due = getLocalCalendarDay(task.dueDate);
  const today = new Date(now);

  return (
    due.getFullYear() === today.getFullYear() &&
    due.getMonth() === today.getMonth() &&
    due.getDate() === today.getDate()
  );
}

function isDueWithinWeek(task: Task, now: number): boolean {
  if (!task.dueDate || task.status === "DONE") return false;

  const dueStart = getLocalCalendarDay(task.dueDate).getTime();
  const today = new Date(now);
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  const weekEnd = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 8,
  ).getTime();

  return dueStart >= todayStart && dueStart < weekEnd;
}

export function matchesDueFilter(
  task: Task,
  due: TaskDueFilter,
  now: number,
): boolean {
  switch (due) {
    case "overdue":
      return isOverdue(task, now);
    case "today":
      return isDueToday(task, now);
    case "week":
      return isDueWithinWeek(task, now);
    case "none":
      return !task.dueDate;
    default:
      return true;
  }
}

export function isTaskOverdue(task: Task, now: number): boolean {
  return isOverdue(task, now);
}

export function isTaskDueToday(task: Task, now: number): boolean {
  return isDueToday(task, now);
}

function matchesSearch(task: Task, query: string): boolean {
  if (!query) return true;
  const haystack = [
    task.title,
    task.description,
    TYPE_LABEL[task.type],
    STATUS_LABEL[task.status],
    PRIORITY_LABEL[task.priority],
    ...task.assignees.flatMap((assignee) => [assignee.name, assignee.username]),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function filterTasks(
  tasks: Task[],
  filters: TaskFilters,
  now: number,
): Task[] {
  const query = filters.q.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filters.state === "active" && task.isArchived) return false;
    if (filters.state === "archived" && !task.isArchived) return false;

    if (filters.status.length > 0 && !filters.status.includes(task.status))
      return false;
    if (filters.type.length > 0 && !filters.type.includes(task.type))
      return false;
    if (
      filters.priority.length > 0 &&
      !filters.priority.includes(task.priority)
    )
      return false;

    if (filters.assignee === "unassigned" && task.assignees.length > 0)
      return false;
    if (filters.assignee && filters.assignee !== "unassigned") {
      if (!task.assignees.some((assignee) => assignee._id === filters.assignee))
        return false;
    }

    if (filters.due && !matchesDueFilter(task, filters.due, now)) return false;

    if (!matchesSearch(task, query)) return false;

    return true;
  });
}
