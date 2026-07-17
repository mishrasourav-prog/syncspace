import type { WorkspaceSummary } from "../types/workspace.types";
import { WorkspaceCard } from "./WorkspaceCard";

interface WorkspaceGridProps {
  workspaces: WorkspaceSummary[];
  onEdit: (workspace: WorkspaceSummary) => void;
  onArchive: (workspace: WorkspaceSummary) => void;
  onRestore: (workspace: WorkspaceSummary) => void;
  onLeave: (workspace: WorkspaceSummary) => void;
}

export function WorkspaceGrid({ workspaces, onEdit, onArchive, onRestore, onLeave }: WorkspaceGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {workspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace._id}
          workspace={workspace}
          onEdit={onEdit}
          onArchive={onArchive}
          onRestore={onRestore}
          onLeave={onLeave}
        />
      ))}
    </div>
  );
}
