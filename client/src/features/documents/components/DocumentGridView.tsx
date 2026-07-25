import { FileText } from "lucide-react";
import type { ProjectDocument } from "../types/document.types";
import { DocumentGridCard } from "./DocumentGridCard";

interface DocumentGridViewProps {
  documents: ProjectDocument[];
  workspaceId: string;
  projectId: string;
  emptyMessage: string;
  canRename: (document: ProjectDocument) => boolean;
  canArchive: (document: ProjectDocument) => boolean;
  canRestore: (document: ProjectDocument) => boolean;
  onRename: (document: ProjectDocument) => void;
  onArchive: (document: ProjectDocument) => void;
  onRestore: (document: ProjectDocument) => void;
}

export function DocumentGridView({
  documents,
  workspaceId,
  projectId,
  emptyMessage,
  canRename,
  canArchive,
  canRestore,
  onRename,
  onArchive,
  onRestore,
}: DocumentGridViewProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-10 text-center">
        <FileText className="mx-auto h-6 w-6 text-muted" />
        <p className="mt-2 text-body">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {documents.map((document) => (
        <DocumentGridCard
          key={document._id}
          document={document}
          workspaceId={workspaceId}
          projectId={projectId}
          canRename={canRename(document)}
          canArchive={canArchive(document)}
          canRestore={canRestore(document)}
          onRename={() => onRename(document)}
          onArchive={() => onArchive(document)}
          onRestore={() => onRestore(document)}
        />
      ))}
    </div>
  );
}
