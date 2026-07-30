import { ChevronDown, Search, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ProjectMember } from "@/features/project-members/types/projectMember.types";
import {
  ALL_PRIORITIES,
  ALL_STATUSES,
  ALL_TYPES,
  PRIORITY_LABEL,
  STATUS_LABEL,
  TYPE_LABEL,
  type TaskDueFilter,
  type TaskFilters,
  type TaskStateFilter,
} from "../../task.filters";
import type {
  TaskPriority,
  TaskStatus,
  TaskType,
} from "../../types/task.types";
import { TaskFiltersPopover } from "./TaskFiltersPopover";

const DUE_OPTIONS: { value: TaskDueFilter; label: string }[] = [
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Due today" },
  { value: "week", label: "Due in next 7 days" },
  { value: "none", label: "No due date" },
];

interface FilterDropdownButtonProps {
  label: string;
  count: number;
  children: React.ReactNode;
}

function FilterDropdownButton({
  label,
  count,
  children,
}: FilterDropdownButtonProps) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={`${label} filter`}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors hover:bg-border/30"
      >
        {label}
        {count > 0 && (
          <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {count}
          </span>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-muted" />
      </PopoverTrigger>
      <PopoverContent className="w-56">{children}</PopoverContent>
    </Popover>
  );
}

interface CheckboxOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function CheckboxOption({ label, checked, onChange }: CheckboxOptionProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-border/40",
        checked && "bg-primary/10 text-primary",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 accent-primary"
      />
      {label}
    </label>
  );
}

interface TaskFilterToolbarProps {
  filters: TaskFilters;
  members: ProjectMember[];
  activeFilterCount: number;
  onSearchChange: (value: string) => void;
  onToggleStatus: (status: TaskStatus) => void;
  onToggleType: (type: TaskType) => void;
  onTogglePriority: (priority: TaskPriority) => void;
  onAssigneeChange: (assignee: string | null) => void;
  onDueChange: (due: TaskDueFilter | null) => void;
  onStateChange: (state: TaskStateFilter) => void;
  onClear: () => void;
}

export function TaskFilterToolbar({
  filters,
  members,
  activeFilterCount,
  onSearchChange,
  onToggleStatus,
  onToggleType,
  onTogglePriority,
  onAssigneeChange,
  onDueChange,
  onStateChange,
  onClear,
}: TaskFilterToolbarProps) {
  const selectedAssigneeMember = members.find(
    (member) => member.user._id === filters.assignee,
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        icon={Search}
        value={filters.q}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search tasks…"
        aria-label="Search tasks and issues"
        className="h-9 w-full max-w-xs sm:w-56"
        rightSlot={
          filters.q ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : undefined
        }
      />

      <FilterDropdownButton label="Status" count={filters.status.length}>
        <p className="mb-1 px-0.5 text-caption uppercase tracking-wide">
          Status
        </p>
        <div className="space-y-0.5">
          {ALL_STATUSES.map((status) => (
            <CheckboxOption
              key={status}
              label={STATUS_LABEL[status]}
              checked={filters.status.includes(status)}
              onChange={() => onToggleStatus(status)}
            />
          ))}
        </div>
      </FilterDropdownButton>

      <FilterDropdownButton label="Type" count={filters.type.length}>
        <p className="mb-1 px-0.5 text-caption uppercase tracking-wide">Type</p>
        <div className="space-y-0.5">
          {ALL_TYPES.map((type) => (
            <CheckboxOption
              key={type}
              label={TYPE_LABEL[type]}
              checked={filters.type.includes(type)}
              onChange={() => onToggleType(type)}
            />
          ))}
        </div>
      </FilterDropdownButton>

      <FilterDropdownButton label="Priority" count={filters.priority.length}>
        <p className="mb-1 px-0.5 text-caption uppercase tracking-wide">
          Priority
        </p>
        <div className="space-y-0.5">
          {ALL_PRIORITIES.map((priority) => (
            <CheckboxOption
              key={priority}
              label={PRIORITY_LABEL[priority]}
              checked={filters.priority.includes(priority)}
              onChange={() => onTogglePriority(priority)}
            />
          ))}
        </div>
      </FilterDropdownButton>

      <Popover>
        <PopoverTrigger
          aria-label="Assignee filter"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors hover:bg-border/30"
        >
          {selectedAssigneeMember ? (
            <Avatar
              src={selectedAssigneeMember.user.avatar}
              name={selectedAssigneeMember.user.name}
              size="sm"
              className="h-4.5 w-4.5"
            />
          ) : (
            <User className="h-3.5 w-3.5" />
          )}
          {selectedAssigneeMember
            ? selectedAssigneeMember.user.name
            : filters.assignee === "unassigned"
              ? "Unassigned"
              : "Assignee"}
          <ChevronDown className="h-3.5 w-3.5 text-muted" />
        </PopoverTrigger>
        <PopoverContent className="w-60 max-h-72 overflow-y-auto">
          <p className="mb-1 px-0.5 text-caption uppercase tracking-wide">
            Assignee
          </p>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => onAssigneeChange(null)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-border/40",
                !filters.assignee && "bg-primary/10 text-primary",
              )}
            >
              All assignees
            </button>
            <button
              type="button"
              onClick={() => onAssigneeChange("unassigned")}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-border/40",
                filters.assignee === "unassigned" &&
                  "bg-primary/10 text-primary",
              )}
            >
              Unassigned
            </button>
            {members.map((member) => (
              <button
                key={member._id}
                type="button"
                onClick={() => onAssigneeChange(member.user._id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-border/40",
                  filters.assignee === member.user._id &&
                    "bg-primary/10 text-primary",
                )}
              >
                <Avatar
                  src={member.user.avatar}
                  name={member.user.name}
                  size="sm"
                />
                <span className="truncate">{member.user.name}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <FilterDropdownButton label="Due date" count={filters.due ? 1 : 0}>
        <p className="mb-1 px-0.5 text-caption uppercase tracking-wide">
          Due date
        </p>
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => onDueChange(null)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-border/40",
              !filters.due && "bg-primary/10 text-primary",
            )}
          >
            Any due date
          </button>
          {DUE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onDueChange(filters.due === option.value ? null : option.value)
              }
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-border/40",
                filters.due === option.value && "bg-primary/10 text-primary",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterDropdownButton>

      <TaskFiltersPopover
        state={filters.state}
        activeFilterCount={activeFilterCount}
        onStateChange={onStateChange}
      />

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          Clear
        </button>
      )}
    </div>
  );
}
