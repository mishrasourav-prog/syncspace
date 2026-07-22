import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  UserPlus,
  X,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  Avatar,
} from "@/components/ui/avatar";

import {
  Input,
} from "@/components/ui/input";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import type {
  ProjectMember,
} from "@/features/project-members/types/projectMember.types";

import {
  cn,
} from "@/lib/utils";

import {
  useAssignTaskMemberMutation,
  useRemoveTaskAssigneeMutation,
} from "../hooks/useTaskAssigneeMutations";

import type {
  Task,
} from "../types/task.types";

interface ManageTaskAssigneesProps {
  task:
    Task;

  projectId:
    string;

  members:
    ProjectMember[];

  canManage:
    boolean;
}

export function ManageTaskAssignees({
  task,
  projectId,
  members,
  canManage,
}: ManageTaskAssigneesProps) {
  const [
    search,
    setSearch,
  ] =
    useState(
      ""
    );

  const assignMutation =
    useAssignTaskMemberMutation(
      projectId
    );

  const removeMutation =
    useRemoveTaskAssigneeMutation(
      projectId
    );

  useEffect(
    () => {
      setSearch(
        ""
      );
    },
    [
      task._id,
    ]
  );

  const assignedIds =
    useMemo(
      () =>
        new Set(
          task.assignees.map(
            (
              assignee
            ) =>
              assignee._id
          )
        ),
      [
        task.assignees,
      ]
    );

  const availableMembers =
    useMemo(
      () => {
        const query =
          search.trim()
            .toLowerCase();

        return members.filter(
          (
            member
          ) => {
            if (
              assignedIds.has(
                member.user._id
              )
            ) {
              return false;
            }

            if (
              !query
            ) {
              return true;
            }

            return [
              member.user.name,
              member.user.username,
              member.user.email,
            ]
              .join(
                " "
              )
              .toLowerCase()
              .includes(
                query
              );
          }
        );
      },
      [
        assignedIds,
        members,
        search,
      ]
    );

  const isMutating =
    assignMutation.isPending ||
    removeMutation.isPending;

  function handleAssign(
    userId:
      string
  ): void {
    if (
      isMutating
    ) {
      return;
    }

    const member =
      members.find(
        (
          candidate
        ) =>
          candidate.user._id ===
          userId
      );

    assignMutation.mutate(
      {
        taskId:
          task._id,
        userId,
      },
      {
        onSuccess:
          () => {
            toast.success(
              member
                ? `${member.user.name} was assigned.`
                : "Member assigned."
            );
          },

        onError:
          (
            error
          ) => {
            toast.error(
              error.message ??
              "Unable to assign member."
            );
          },
      }
    );
  }

  function handleRemove(
    userId:
      string
  ): void {
    if (
      isMutating
    ) {
      return;
    }

    const assignee =
      task.assignees.find(
        (
          candidate
        ) =>
          candidate._id ===
          userId
      );

    removeMutation.mutate(
      {
        taskId:
          task._id,
        userId,
      },
      {
        onSuccess:
          () => {
            toast.success(
              assignee
                ? `${assignee.name} was unassigned.`
                : "Assignee removed."
            );
          },

        onError:
          (
            error
          ) => {
            toast.error(
              error.message ??
              "Unable to remove assignee."
            );
          },
      }
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        {
          task.assignees.map(
            (
              assignee
            ) => (
              <span
                key={
                  assignee._id
                }
                className="flex items-center gap-1.5 rounded-full border border-border bg-background/60 py-1 pl-1 pr-2 text-xs text-foreground"
              >
                <Avatar
                  src={
                    assignee.avatar
                  }
                  name={
                    assignee.name
                  }
                  size="sm"
                />

                {
                  assignee.name
                }

                {
                  canManage && (
                    <button
                      type="button"
                      onClick={
                        () =>
                          handleRemove(
                            assignee._id
                          )
                      }
                      disabled={
                        isMutating
                      }
                      aria-label={
                        `Remove ${assignee.name}`
                      }
                      className="text-muted transition-colors hover:text-danger disabled:opacity-50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )
                }
              </span>
            )
          )
        }

        {
          task.assignees.length ===
            0 && (
            <span className="text-caption">
              No one assigned yet.
            </span>
          )
        }

        {
          canManage && (
            <Popover>
              <PopoverTrigger
                aria-label="Assign a member"
                className="flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-1 text-xs text-muted transition-colors hover:border-muted/60 hover:text-foreground"
              >
                <UserPlus className="h-3 w-3" />
                Assign
              </PopoverTrigger>

              <PopoverContent className="w-64 max-w-[calc(100vw-2rem)]">
                <p className="mb-2 px-0.5 text-caption uppercase tracking-wide">
                  Project members
                </p>

                <Input
                  icon={
                    Search
                  }
                  value={
                    search
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setSearch(
                        event.target.value
                      )
                  }
                  placeholder="Search members…"
                  aria-label="Search project members"
                  className="mb-2 h-9"
                />

                <div className="max-h-56 space-y-0.5 overflow-y-auto">
                  {
                    availableMembers.map(
                      (
                        member
                      ) => (
                        <button
                          key={
                            member._id
                          }
                          type="button"
                          onClick={
                            () =>
                              handleAssign(
                                member.user._id
                              )
                          }
                          disabled={
                            isMutating
                          }
                          className={
                            cn(
                              "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-border/40 disabled:opacity-50"
                            )
                          }
                        >
                          <Avatar
                            src={
                              member.user.avatar
                            }
                            name={
                              member.user.name
                            }
                            size="sm"
                          />

                          <span className="min-w-0 flex-1">
                            <span className="block truncate">
                              {
                                member.user.name
                              }
                            </span>
                            <span className="block truncate text-[11px] text-muted">
                              @
                              {
                                member.user.username
                              }
                            </span>
                          </span>
                        </button>
                      )
                    )
                  }

                  {
                    availableMembers.length ===
                      0 && (
                      <p className="px-2 py-4 text-center text-caption">
                        {
                          search
                            ? "No matching members."
                            : "Every project member is already assigned."
                        }
                      </p>
                    )
                  }
                </div>
              </PopoverContent>
            </Popover>
          )
        }
      </div>
    </div>
  );
}
