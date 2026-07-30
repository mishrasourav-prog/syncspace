import { ShieldAlert } from "lucide-react";
import type { WorkspaceSummary } from "@/features/workspaces/types/workspace.types";
import type { ProjectRole } from "@/features/project-members/types/projectMember.types";
import type { Project } from "../../types/project.types";

interface ProjectReadOnlyBannerProps {
  project: Project;
  workspace: WorkspaceSummary;
  role: ProjectRole | undefined;
}

export function ProjectReadOnlyBanner({
  project,
  workspace,
  role,
}: ProjectReadOnlyBannerProps) {
  if (workspace.isArchived) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          This project's workspace is archived, so the project is read-only
          until the workspace is restored.
        </p>
      </div>
    );
  }

  if (project.isArchived) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          This project is archived and read-only.
          {role === "admin" && " Restore it before making changes."}
        </p>
      </div>
    );
  }

  return null;
}
