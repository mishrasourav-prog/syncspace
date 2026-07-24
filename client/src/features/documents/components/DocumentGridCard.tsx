import {
  Archive,
  ArchiveRestore,
  FileText,
  MoreHorizontal,
  Pencil,
} from "lucide-react";

import {
  Avatar,
} from "@/components/ui/avatar";

import {
  Badge,
} from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  formatDateTime,
  formatRelativeTime,
} from "@/lib/date";

import type {
  ProjectDocument,
} from "../types/document.types";

interface DocumentGridCardProps {
  document: ProjectDocument;
  canRename: boolean;
  canArchive: boolean;
  canRestore: boolean;
  onRename: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export function DocumentGridCard({
  document,
  canRename,
  canArchive,
  canRestore,
  onRename,
  onArchive,
  onRestore,
}: DocumentGridCardProps) {
  const hasMenu =
    canRename ||
    canArchive ||
    canRestore;

  return (
    <article className="flex min-h-48 flex-col gap-3 rounded-xl border border-border/60 bg-surface/40 p-4 transition-colors hover:bg-surface/70">
      <div className="flex items-start justify-between gap-2">
        <span
          className={
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg " +
            (document.isArchived
              ? "bg-border/40 text-muted"
              : "bg-primary/15 text-primary")
          }
        >
          <FileText className="h-5 w-5" />
        </span>

        {
          hasMenu ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={
                  `Actions for ${document.title}`
                }
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                {
                  canRename && (
                    <DropdownMenuItem
                      onClick={
                        onRename
                      }
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Rename
                    </DropdownMenuItem>
                  )
                }

                {
                  canArchive && (
                    <DropdownMenuItem
                      variant="danger"
                      onClick={
                        onArchive
                      }
                    >
                      <Archive className="h-3.5 w-3.5" />
                      Archive
                    </DropdownMenuItem>
                  )
                }

                {
                  canRestore && (
                    <DropdownMenuItem
                      onClick={
                        onRestore
                      }
                    >
                      <ArchiveRestore className="h-3.5 w-3.5" />
                      Restore
                    </DropdownMenuItem>
                  )
                }
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span
              className="h-8 w-8 shrink-0"
              aria-hidden
            />
          )
        }
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-foreground">
          {
            document.title
          }
        </h3>

        <p className="mt-1 truncate text-caption">
          Created by {document.createdBy?.name ?? "Unavailable member"}
        </p>

        <p
          className="mt-1 truncate text-[11px] text-muted"
          title={
            formatDateTime(
              document.updatedAt
            )
          }
        >
          Updated {formatRelativeTime(document.updatedAt)}
        </p>
      </div>

      <div className="flex min-w-0 items-center gap-2 border-t border-border/60 pt-3">
        <Avatar
          src={
            document.updatedBy
              ?.avatar
          }
          name={
            document.updatedBy
              ?.name ??
            "Unavailable member"
          }
          size="sm"
        />

        <span className="min-w-0 flex-1 truncate text-caption">
          Updated by {document.updatedBy?.name ?? "Unavailable member"}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="neutral">
          v{document.revision}
        </Badge>

        <Badge
          variant={
            document.isArchived
              ? "neutral"
              : "success"
          }
        >
          {
            document.isArchived
              ? "Archived"
              : "Active"
          }
        </Badge>
      </div>
    </article>
  );
}
