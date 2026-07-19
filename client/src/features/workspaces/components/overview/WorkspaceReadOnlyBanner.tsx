import { ShieldAlert } from "lucide-react";
import type { WorkspaceSummary } from "../../types/workspace.types";

interface WorkspaceReadOnlyBannerProps {
  workspace: WorkspaceSummary;
}

export function WorkspaceReadOnlyBanner({ workspace }: WorkspaceReadOnlyBannerProps) {
  if (!workspace.isArchived) return null;

  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        This workspace is archived and read-only.
        {workspace.role === "owner" && " Restore it before making changes."}
      </p>
    </div>
  );
}
