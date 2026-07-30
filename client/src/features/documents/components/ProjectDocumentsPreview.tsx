import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/date";
import { DashboardSectionError } from "@/features/workspaces/components/dashboard/DashboardSectionError";
import { useProjectDocumentsQuery } from "../hooks/useDocumentQueries";

const INITIAL_VISIBLE = 5;

function DocumentRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5">
      <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

interface ProjectDocumentsPreviewProps {
  projectId: string;
  search: string;
}

export function ProjectDocumentsPreview({
  projectId,
  search,
}: ProjectDocumentsPreviewProps) {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const documentsQuery = useProjectDocumentsQuery(projectId, search);
  const [showAll, setShowAll] = useState(false);
  const documentsPath = `/workspaces/${workspaceId}/projects/${projectId}/documents`;

  const documents = documentsQuery.data?.documents ?? [];
  const nextCursor = documentsQuery.data?.nextCursor ?? null;
  const visibleDocuments = showAll
    ? documents
    : documents.slice(0, INITIAL_VISIBLE);
  const hasMore = documents.length > INITIAL_VISIBLE;

  const countLabel = nextCursor ? `${documents.length}+` : documents.length;

  return (
    <section
      id="documents"
      aria-labelledby="project-documents-heading"
      className="scroll-mt-24 rounded-xl border border-border bg-surface/60 p-4 shadow-soft"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="project-documents-heading" className="text-h3 text-foreground">
          Documents
          {!documentsQuery.isLoading && !documentsQuery.isError && (
            <span className="ml-2 text-caption">{countLabel}</span>
          )}
        </h2>
        <Link
          to={documentsPath}
          className="shrink-0 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          Open Documents
        </Link>
      </div>

      {documentsQuery.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <DocumentRowSkeleton key={index} />
          ))}
        </div>
      )}

      {documentsQuery.isError && (
        <DashboardSectionError
          message={documentsQuery.error?.message ?? "Unable to load documents."}
          onRetry={() => documentsQuery.refetch()}
        />
      )}

      {!documentsQuery.isLoading &&
        !documentsQuery.isError &&
        documents.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-8 text-center">
            <FileText className="mx-auto h-6 w-6 text-muted" />
            <p className="mt-2 text-body">
              {search ? "No documents match your search." : "No documents yet."}
            </p>
          </div>
        )}

      {!documentsQuery.isLoading &&
        !documentsQuery.isError &&
        documents.length > 0 && (
          <div className="space-y-2">
            {visibleDocuments.map((document) => (
              <Link
                key={document._id}
                to={`${documentsPath}/${document._id}`}
                className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:bg-surface/70"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/15 text-success">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {document.title || "Untitled document"}
                  </p>
                  <p className="truncate text-caption">
                    {document.createdBy?.name ?? "Unknown"}
                    {document.updatedBy &&
                    document.updatedBy._id !== document.createdBy?._id
                      ? ` · updated by ${document.updatedBy.name}`
                      : ""}
                    {" · rev "}
                    {document.revision}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-muted">
                  {formatRelativeTime(document.updatedAt)}
                </span>
              </Link>
            ))}

            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAll((value) => !value)}
                className="w-full rounded-lg py-2 text-center text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                {showAll ? "Show less" : "View all"}
              </button>
            )}

            {nextCursor && (
              <p className="pt-1 text-center text-[11px] text-muted/70">
                Showing the 50 most recent documents.
              </p>
            )}
          </div>
        )}
    </section>
  );
}
