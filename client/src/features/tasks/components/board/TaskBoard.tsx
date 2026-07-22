import {
  useState,
} from "react";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import {
  AlertTriangle,
} from "lucide-react";

import {
  ALL_STATUSES,
} from "../../task.filters";

import type {
  Task,
  TaskStatus,
} from "../../types/task.types";

import {
  TaskBoardColumn,
} from "./TaskBoardColumn";

import {
  TaskCard,
} from "./TaskCard";

interface TaskBoardProps {
  columns:
    Record<TaskStatus, Task[]>;

  now:
    number;

  onTaskClick:
    (task: Task) => void;

  reorderDisabled:
    boolean;

  reorderDisabledReason?:
    string;

  onReorder:
    (
      columns:
        Record<TaskStatus, Task[]>,
      affectedStatuses:
        TaskStatus[]
    ) => void;

  onAddTask?:
    () => void;
}

export function TaskBoard({
  columns,
  now,
  onTaskClick,
  reorderDisabled,
  reorderDisabledReason,
  onReorder,
  onAddTask,
}: TaskBoardProps) {
  const [
    activeTask,
    setActiveTask,
  ] =
    useState<Task | null>(
      null
    );

  const sensors =
    useSensors(
      useSensor(
        PointerSensor,
        {
          activationConstraint: {
            distance:
              8,
          },
        }
      ),
      useSensor(
        KeyboardSensor,
        {
          coordinateGetter:
            sortableKeyboardCoordinates,
        }
      )
    );

  function findColumnOf(
    taskId:
      string
  ): TaskStatus | undefined {
    return ALL_STATUSES.find(
      (
        status
      ) =>
        columns[
          status
        ].some(
          (
            task
          ) =>
            task._id ===
            taskId
        )
    );
  }

  function handleDragStart(
    event:
      DragStartEvent
  ): void {
    const activeId =
      String(
        event.active.id
      );

    const column =
      findColumnOf(
        activeId
      );

    if (
      !column
    ) {
      return;
    }

    const task =
      columns[
        column
      ].find(
        (
          item
        ) =>
          item._id ===
          activeId
      );

    setActiveTask(
      task ??
        null
    );
  }

  function handleDragEnd(
    event:
      DragEndEvent
  ): void {
    setActiveTask(
      null
    );

    if (
      reorderDisabled
    ) {
      return;
    }

    const {
      active,
      over,
    } =
      event;

    if (
      !over
    ) {
      return;
    }

    const activeId =
      String(
        active.id
      );

    const overId =
      String(
        over.id
      );

    const sourceColumn =
      findColumnOf(
        activeId
      );

    if (
      !sourceColumn
    ) {
      return;
    }

    const isOverColumn =
      ALL_STATUSES.includes(
        over.id as TaskStatus
      );

    const targetColumn =
      isOverColumn
        ? over.id as TaskStatus
        : findColumnOf(
            overId
          );

    if (
      !targetColumn
    ) {
      return;
    }

    const next:
      Record<TaskStatus, Task[]> = {
        TODO: [
          ...columns.TODO,
        ],
        IN_PROGRESS: [
          ...columns.IN_PROGRESS,
        ],
        IN_REVIEW: [
          ...columns.IN_REVIEW,
        ],
        DONE: [
          ...columns.DONE,
        ],
      };

    if (
      sourceColumn ===
      targetColumn
    ) {
      const sourceList =
        columns[
          sourceColumn
        ];

      const oldIndex =
        sourceList.findIndex(
          (
            task
          ) =>
            task._id ===
            activeId
        );

      const newIndex =
        isOverColumn
          ? sourceList.length -
            1
          : sourceList.findIndex(
              (
                task
              ) =>
                task._id ===
                overId
            );

      if (
        oldIndex <
          0 ||
        newIndex <
          0 ||
        oldIndex ===
          newIndex
      ) {
        return;
      }

      next[
        sourceColumn
      ] =
        arrayMove(
          sourceList,
          oldIndex,
          newIndex
        );

      onReorder(
        next,
        [
          sourceColumn,
        ]
      );

      return;
    }

    const sourceList =
      next[
        sourceColumn
      ];

    const activeIndex =
      sourceList.findIndex(
        (
          task
        ) =>
          task._id ===
          activeId
      );

    if (
      activeIndex ===
      -1
    ) {
      return;
    }

    const [
      movedTask,
    ] =
      sourceList.splice(
        activeIndex,
        1
      );

    if (
      !movedTask
    ) {
      return;
    }

    const targetList =
      next[
        targetColumn
      ];

    let insertIndex =
      targetList.length;

    if (
      !isOverColumn
    ) {
      const overIndex =
        targetList.findIndex(
          (
            task
          ) =>
            task._id ===
            overId
        );

      if (
        overIndex !==
        -1
      ) {
        insertIndex =
          overIndex;
      }
    }

    targetList.splice(
      insertIndex,
      0,
      {
        ...movedTask,
        status:
          targetColumn,
      }
    );

    onReorder(
      next,
      [
        sourceColumn,
        targetColumn,
      ]
    );
  }

  return (
    <div className="space-y-2">
      {
        reorderDisabled &&
          reorderDisabledReason && (
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <AlertTriangle className="h-3.5 w-3.5" />
            {
              reorderDisabledReason
            }
          </p>
        )
      }

      <DndContext
        sensors={
          sensors
        }
        collisionDetection={
          closestCorners
        }
        onDragStart={
          handleDragStart
        }
        onDragCancel={
          () =>
            setActiveTask(
              null
            )
        }
        onDragEnd={
          handleDragEnd
        }
      >
        <div
          className="flex gap-3 overflow-x-auto pb-2"
          aria-label="Task board"
        >
          {
            ALL_STATUSES.map(
              (
                status
              ) => (
                <TaskBoardColumn
                  key={
                    status
                  }
                  status={
                    status
                  }
                  tasks={
                    columns[
                      status
                    ]
                  }
                  now={
                    now
                  }
                  onTaskClick={
                    onTaskClick
                  }
                  reorderDisabled={
                    reorderDisabled
                  }
                  onAddTask={
                    status ===
                      "TODO"
                      ? onAddTask
                      : undefined
                  }
                />
              )
            )
          }
        </div>

        <DragOverlay>
          {
            activeTask && (
              <TaskCard
                task={
                  activeTask
                }
                now={
                  now
                }
                onClick={
                  () =>
                    undefined
                }
                isOverlay
              />
            )
          }
        </DragOverlay>
      </DndContext>
    </div>
  );
}
