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

function buildPrintableHtml(title: string, html: string): string {
  const safeTitle = escapeHtml(title.trim() || "Untitled document");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    <style>
      @page { size: A4; margin: 18mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: #111827;
        background: #ffffff;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 11pt;
        line-height: 1.65;
        overflow-wrap: anywhere;
      }
      h1 { font-size: 24pt; margin: 0 0 14pt; }
      h2 { font-size: 18pt; margin: 20pt 0 8pt; }
      h3 { font-size: 14pt; margin: 16pt 0 6pt; }
      p { margin: 7pt 0; }
      blockquote { margin: 12pt 0; padding-left: 12pt; border-left: 3px solid #9ca3af; color: #4b5563; }
      pre { white-space: pre-wrap; overflow-wrap: anywhere; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 10pt; }
      code { background: #f3f4f6; border-radius: 3px; padding: 1pt 3pt; }
      pre code { background: transparent; padding: 0; }
      a { color: #356c8c; text-decoration: underline; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; margin: 12pt 0; }
      th, td { border: 1px solid #9ca3af; padding: 6pt; vertical-align: top; overflow-wrap: anywhere; }
      th { background: #f3f4f6; }
      img { max-width: 100%; height: auto; }
      hr { border: 0; border-top: 1px solid #d1d5db; margin: 16pt 0; }
      ul[data-type="taskList"] { list-style: none; padding-left: 0; }
      @media print {
        a { color: inherit; }
        pre, blockquote, table { break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    <h1>${safeTitle}</h1>
    ${html}
  </body>
</html>`;
}

export function downloadDocumentAsHtml(title: string, html: string): void {
  downloadBlob(
    new Blob([buildPrintableHtml(title, html)], { type: "text/html;charset=utf-8" }),
    `${sanitizeFilenamePart(title)}.html`
  );
}

/**
 * Opens a print-optimized document. The browser's native print dialog can save
 * it as a PDF without adding a large or fragile client-side PDF dependency.
 */
export function downloadDocumentAsPdf(title: string, html: string): boolean {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return false;

  // Prevent the exported page from controlling the SyncSpace window while
  // keeping a usable Window reference for document.write and print().
  printWindow.opener = null;

  printWindow.document.open();
  printWindow.document.write(buildPrintableHtml(title, html));
  printWindow.document.close();

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  if (printWindow.document.readyState === "complete") {
    window.setTimeout(triggerPrint, 150);
  } else {
    printWindow.addEventListener("load", () => window.setTimeout(triggerPrint, 150), {
      once: true,
    });
  }

  return true;
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
