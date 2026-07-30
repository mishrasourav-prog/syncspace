import { FileText } from "lucide-react";

import type { ProjectDocument } from "../types/document.types";

import { DocumentListRow } from "./DocumentListRow";

interface DocumentListViewProps {
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

export function DocumentListView({
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
}: DocumentListViewProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-10 text-center">
        <FileText className="mx-auto h-6 w-6 text-muted" />
        <p className="mt-2 text-body">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <section
      aria-label="Documents list"
      className="rounded-xl border border-border bg-surface/30 p-2 shadow-soft"
    >
      <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(120px,0.75fr)_minmax(120px,0.75fr)_auto_auto_auto] items-center gap-4 border-b border-border px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted sm:grid">
        <span>Name</span>
        <span>Last updated</span>
        <span>Updated by</span>
        <span>Revision</span>
        <span>State</span>
        <span className="sr-only">Actions</span>
      </div>

      <div className="space-y-2 pt-2">
        {documents.map((document) => (
          <DocumentListRow
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
    </section>
  );
}
