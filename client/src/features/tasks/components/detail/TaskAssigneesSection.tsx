import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProjectMember } from "@/features/project-members/types/projectMember.types";
import { useTaskAssigneesQuery } from "../../hooks/useTaskQueries";
import type { Task } from "../../types/task.types";
import type { TaskAssignee } from "../../types/taskAssignee.types";
import { ManageTaskAssignees } from "../ManageTaskAssignees";

interface TaskAssigneesSectionProps {
  task: Task;
  projectId: string;
  members: ProjectMember[];
  canManage: boolean;
}

export function TaskAssigneesSection({ task, projectId, members, canManage }: TaskAssigneesSectionProps) {
  const assigneesQuery = useTaskAssigneesQuery(projectId, task._id);

  const assigneeDetails = useMemo(() => {
    const map: Record<string, TaskAssignee> = {};
    for (const assignee of assigneesQuery.data ?? []) {
      map[assignee.user._id] = assignee;
    }
    return map;
  }, [assigneesQuery.data]);

  return (
    <div>
      <h2 className="text-h3 mb-2 text-foreground">Assignees</h2>

      {assigneesQuery.isLoading && task.assignees.length > 0 ? (
        <div className="flex gap-2">
          {task.assignees.map((assignee) => (
            <Skeleton key={assignee._id} className="h-7 w-24 rounded-full" />
          ))}
        </div>
      ) : (
        <ManageTaskAssignees
          task={task}
          projectId={projectId}
          members={members}
          canManage={canManage}
          assigneeDetails={assigneesQuery.isSuccess ? assigneeDetails : undefined}
        />
      )}

      {assigneesQuery.isError && (
        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
          <span>Some assignee details couldn't load.</span>
          <button
            type="button"
            onClick={() => void assigneesQuery.refetch()}
            className="font-medium text-primary hover:text-primary/80"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
