import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Copy,
  Download,
  FileJson,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentActionsPanelProps {
  canArchive: boolean;
  canRestore: boolean;
  canDuplicate: boolean;
  isDuplicating: boolean;
  canDownloadHtml: boolean;
  canDownloadPdf: boolean;
  onDuplicate: () => void;
  onDownloadHtml: () => void;
  onDownloadPdf: () => void;
  onDownloadJson: () => void;
  onCopyId: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onArchive: () => void;
  onRestore: () => void;
  onBackToDocuments: () => void;
}

export function DocumentActionsPanel({
  canArchive,
  canRestore,
  canDuplicate,
  isDuplicating,
  canDownloadHtml,
  canDownloadPdf,
  onDuplicate,
  onDownloadHtml,
  onDownloadPdf,
  onDownloadJson,
  onCopyId,
  onRefresh,
  isRefreshing,
  onArchive,
  onRestore,
  onBackToDocuments,
}: DocumentActionsPanelProps) {
  return (
    <section className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
      <h2 className="text-h3 mb-3 text-foreground">Supported actions</h2>

      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onDuplicate}
          disabled={!canDuplicate || isDuplicating}
          className="w-full justify-start"
        >
          <Copy className="h-3.5 w-3.5" />
          {isDuplicating ? "Duplicating…" : "Duplicate document"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onDownloadPdf}
          disabled={!canDownloadPdf}
          className="w-full justify-start"
        >
          <FileText className="h-3.5 w-3.5" />
          Download PDF
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onDownloadHtml}
          disabled={!canDownloadHtml}
          className="w-full justify-start"
        >
          <Download className="h-3.5 w-3.5" />
          Download HTML
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onDownloadJson}
          className="w-full justify-start"
        >
          <FileJson className="h-3.5 w-3.5" />
          Download JSON
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCopyId}
          className="w-full justify-start"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy document ID
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full justify-start"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh document
        </Button>

        {canArchive && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onArchive}
            className="w-full justify-start"
          >
            <Archive className="h-3.5 w-3.5" />
            Archive document
          </Button>
        )}

        {canRestore && (
          <Button
            type="button"
            size="sm"
            onClick={onRestore}
            className="w-full justify-start"
          >
            <ArchiveRestore className="h-3.5 w-3.5" />
            Restore document
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBackToDocuments}
          className="w-full justify-start"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Documents
        </Button>
      </div>
    </section>
  );
}
