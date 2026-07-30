import type { HTMLAttributes } from "react";

import { useSortable } from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import type { Task } from "../../types/task.types";

import { TaskCard } from "./TaskCard";

interface SortableTaskCardProps {
  task: Task;

  now: number;

  onClick: () => void;

  disabled?: boolean;
}

export function SortableTaskCard({
  task,
  now,
  onClick,
  disabled = false,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragHandleProps = disabled
    ? undefined
    : ({
        ...attributes,
        ...listeners,
      } as HTMLAttributes<HTMLButtonElement>);

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        now={now}
        onClick={onClick}
        isDragging={isDragging}
        dragHandleProps={dragHandleProps}
      />
    </div>
  );
}
