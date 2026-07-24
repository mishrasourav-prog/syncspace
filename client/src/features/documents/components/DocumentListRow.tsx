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

interface DocumentListRowProps {
  document: ProjectDocument;
  canRename: boolean;
  canArchive: boolean;
  canRestore: boolean;
  onRename: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export function DocumentListRow({
  document,
  canRename,
  canArchive,
  canRestore,
  onRename,
  onArchive,
  onRestore,
}: DocumentListRowProps) {
  const hasMenu =
    canRename ||
    canArchive ||
    canRestore;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border/60 bg-surface/40 px-3 py-3 transition-colors hover:bg-surface/70 sm:grid-cols-[minmax(0,1.6fr)_minmax(120px,0.75fr)_minmax(120px,0.75fr)_auto_auto_auto] sm:gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg " +
            (document.isArchived
              ? "bg-border/40 text-muted"
              : "bg-primary/15 text-primary")
          }
        >
          <FileText className="h-4 w-4" />
        </span>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {
              document.title
            }
          </p>

          <p className="mt-0.5 truncate text-caption">
            Created by {document.createdBy?.name ?? "Unavailable member"}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:hidden">
            <Badge variant="neutral">
              rev {document.revision}
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
        </div>
      </div>

      <div
        className="hidden min-w-0 text-caption sm:block"
        title={
          formatDateTime(
            document.updatedAt
          )
        }
      >
        <p className="text-foreground">
          {
            formatRelativeTime(
              document.updatedAt
            )
          }
        </p>

        <p className="truncate text-[11px] text-muted">
          {
            formatDateTime(
              document.updatedAt
            )
          }
        </p>
      </div>

      <div className="hidden min-w-0 items-center gap-2 sm:flex">
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

        <span className="truncate text-caption">
          {
            document.updatedBy
              ?.name ??
            "Unavailable member"
          }
        </span>
      </div>

      <Badge
        variant="neutral"
        className="hidden shrink-0 sm:inline-flex"
      >
        v{document.revision}
      </Badge>

      <Badge
        variant={
          document.isArchived
            ? "neutral"
            : "success"
        }
        className="hidden shrink-0 sm:inline-flex"
      >
        {
          document.isArchived
            ? "Archived"
            : "Active"
        }
      </Badge>

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
  );
}
