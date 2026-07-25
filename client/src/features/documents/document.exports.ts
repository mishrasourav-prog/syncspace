import type { ProjectDocument } from "./types/document.types";

function sanitizeFilenamePart(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug.length > 0 ? slug : "untitled-document";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadDocumentAsHtml(title: string, html: string): void {
  const safeTitle = escapeHtml(title.trim() || "Untitled document");
  const document_ = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
  </head>
  <body>
${html}
  </body>
</html>
`;

  downloadBlob(
    new Blob([document_], { type: "text/html;charset=utf-8" }),
    `${sanitizeFilenamePart(title)}.html`
  );
}

export function downloadDocumentAsJson(doc: ProjectDocument, title: string, content: unknown): void {
  const payload = {
    documentId: doc._id,
    title: title.trim() || "Untitled document",
    content,
    basedOnRevision: doc.revision,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    exportedAt: new Date().toISOString(),
  };

  downloadBlob(
    new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" }),
    `${sanitizeFilenamePart(title)}.json`
  );
}

export function downloadLocalDraft(documentId: string, localTitle: string, localContent: unknown, basedOnRevision: number): void {
  const payload = {
    documentId,
    localTitle: localTitle.trim() || "Untitled document",
    localContent,
    basedOnRevision,
    exportedAt: new Date().toISOString(),
  };

  downloadBlob(
    new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" }),
    `${sanitizeFilenamePart(localTitle)}-draft.json`
  );
}
