import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/date";
import type { ProjectDocument } from "../../types/document.types";

function shortenId(id: string): string {
  if (id.length <= 10) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

interface DocumentInfoPanelProps {
  document: ProjectDocument;
}

export function DocumentInfoPanel({ document }: DocumentInfoPanelProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopyId() {
    try {
      await navigator.clipboard.writeText(document._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (permissions/insecure context); the ID remains visible for manual copy.
    }
  }

  return (
    <section className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
      <h2 className="text-h3 mb-3 text-foreground">Document</h2>

      <dl className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">State</dt>
          <dd>
            <Badge variant={document.isArchived ? "neutral" : "success"}>
              {document.isArchived ? "Archived" : "Active"}
            </Badge>
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Revision</dt>
          <dd className="text-foreground">{document.revision}</dd>
        </div>

        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Document ID</dt>
          <dd className="flex items-center gap-1.5">
            <span title={document._id} className="font-mono text-xs text-foreground">
              {shortenId(document._id)}
            </span>
            <button
              type="button"
              onClick={() => void handleCopyId()}
              aria-label="Copy document ID"
              className="rounded p-1 text-muted transition-colors hover:bg-border/40 hover:text-foreground"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </dd>
        </div>

        <div className="border-t border-border/60 pt-2.5">
          <dt className="text-muted">Created by</dt>
          <dd className="mt-0.5 text-foreground">{document.createdBy?.name ?? "Unavailable member"}</dd>
        </div>

        <div>
          <dt className="text-muted">Created on</dt>
          <dd className="mt-0.5 text-foreground">{formatDateTime(document.createdAt)}</dd>
        </div>

        <div className="border-t border-border/60 pt-2.5">
          <dt className="text-muted">Last updated by</dt>
          <dd className="mt-0.5 text-foreground">{document.updatedBy?.name ?? "Unavailable member"}</dd>
        </div>

        <div>
          <dt className="text-muted">Last updated on</dt>
          <dd className="mt-0.5 text-foreground">{formatDateTime(document.updatedAt)}</dd>
        </div>

        {document.isArchived && document.archivedAt && (
          <div className="border-t border-border/60 pt-2.5">
            <dt className="text-muted">Archived on</dt>
            <dd className="mt-0.5 text-foreground">{formatDateTime(document.archivedAt)}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
