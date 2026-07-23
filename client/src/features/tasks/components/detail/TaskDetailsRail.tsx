import { useState, type ReactNode } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/date";
import type { ProjectMember } from "@/features/project-members/types/projectMember.types";
import type { Task } from "../../types/task.types";

interface TaskDetailsRailProps {
  task: Task;
  members: ProjectMember[];
}

function resolveMemberName(members: ProjectMember[], userId: string | undefined): string {
  if (!userId) return "—";
  const member = members.find((candidate) => candidate.user._id === userId);
  return member ? member.user.name : "Unavailable member";
}

function shortTaskId(id: string): string {
  return id.length > 10 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
}

export function TaskDetailsRail({ task, members }: TaskDetailsRailProps) {
  const [copied, setCopied] = useState(false);

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

  const rows: { label: string; value: ReactNode }[] = [
    {
      label: "Task ID",
      value: (
        <button
          type="button"
          onClick={handleCopyId}
          title={task._id}
          className="flex items-center gap-1.5 font-mono text-xs text-foreground transition-colors hover:text-primary"
        >
          {shortTaskId(task._id)}
          <Copy className="h-3 w-3" />
          {copied && <span className="text-[10px] text-success">Copied</span>}
        </button>
      ),
    },
    { label: "Created by", value: resolveMemberName(members, task.createdBy) },
    { label: "Created on", value: formatDateTime(task.createdAt) },
    { label: "Last updated by", value: task.updatedBy ? resolveMemberName(members, task.updatedBy) : "—" },
    { label: "Last updated on", value: formatDateTime(task.updatedAt) },
    { label: "Completed by", value: task.completedAt ? resolveMemberName(members, task.completedBy) : "—" },
    { label: "Completed on", value: task.completedAt ? formatDateTime(task.completedAt) : "—" },
    {
      label: "State",
      value: <Badge variant={task.isArchived ? "warning" : "success"}>{task.isArchived ? "Archived" : "Active"}</Badge>,
    },
  ];

  return (
    <section className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
      <h2 className="text-h3 mb-3 text-foreground">Details</h2>
      <dl className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
            <dt className="text-muted">{row.label}</dt>
            <dd className="text-right text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
