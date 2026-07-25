import type { JSONContent } from "@tiptap/react";

export const EMPTY_DOCUMENT_CONTENT: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export interface NormalizedDocumentContent {
  editorContent: JSONContent;
  /** True when the stored value cannot be represented safely by this editor schema. */
  isUnsupportedLegacyContent: boolean;
}

type JsonObject = Record<string, unknown>;

const BLOCK_NODE_TYPES = new Set([
  "paragraph",
  "heading",
  "blockquote",
  "bulletList",
  "orderedList",
  "taskList",
  "codeBlock",
  "horizontalRule",
  "table",
]);

const INLINE_NODE_TYPES = new Set(["text", "hardBreak"]);
const MARK_TYPES = new Set(["bold", "italic", "strike", "underline", "code", "link"]);

function isPlainObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeLinkHref(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const href = value.trim();
  if (!href) return false;

  if (href.startsWith("/") || href.startsWith("#")) return true;

  const lower = href.toLowerCase();
  return lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("mailto:") || lower.startsWith("tel:");
}

function sanitizeMarks(value: unknown): JSONContent["marks"] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return undefined;

  const marks: NonNullable<JSONContent["marks"]> = [];

  for (const candidate of value) {
    if (!isPlainObject(candidate) || typeof candidate.type !== "string" || !MARK_TYPES.has(candidate.type)) {
      continue;
    }

    if (candidate.type !== "link") {
      marks.push({ type: candidate.type });
      continue;
    }

    const attrs = isPlainObject(candidate.attrs) ? candidate.attrs : {};
    if (!isSafeLinkHref(attrs.href)) continue;

    marks.push({
      type: "link",
      attrs: {
        href: attrs.href.trim(),
        target: "_blank",
        rel: "noopener noreferrer nofollow",
      },
    });
  }

  return marks.length > 0 ? marks : undefined;
}

function sanitizeAttrs(type: string, value: unknown): JsonObject | undefined {
  const attrs = isPlainObject(value) ? value : {};

  switch (type) {
    case "heading": {
      const level = typeof attrs.level === "number" && Number.isInteger(attrs.level) && attrs.level >= 1 && attrs.level <= 6
        ? attrs.level
        : 1;
      return { level };
    }

    case "orderedList": {
      const start = typeof attrs.start === "number" && Number.isInteger(attrs.start) && attrs.start >= 1 ? attrs.start : 1;
      return { start };
    }

    case "taskItem":
      return { checked: attrs.checked === true };

    case "codeBlock":
      return { language: typeof attrs.language === "string" ? attrs.language : null };

    case "tableCell":
    case "tableHeader": {
      const colspan = typeof attrs.colspan === "number" && Number.isInteger(attrs.colspan) && attrs.colspan >= 1 ? attrs.colspan : 1;
      const rowspan = typeof attrs.rowspan === "number" && Number.isInteger(attrs.rowspan) && attrs.rowspan >= 1 ? attrs.rowspan : 1;
      const colwidth = Array.isArray(attrs.colwidth)
        ? attrs.colwidth.filter((width): width is number => typeof width === "number" && Number.isFinite(width) && width > 0)
        : null;

      return {
        colspan,
        rowspan,
        colwidth: colwidth && colwidth.length > 0 ? colwidth : null,
      };
    }

    default:
      return undefined;
  }
}

function allowedChildrenFor(type: string): Set<string> | null {
  switch (type) {
    case "doc":
    case "blockquote":
    case "listItem":
    case "taskItem":
    case "tableCell":
    case "tableHeader":
      return BLOCK_NODE_TYPES;

    case "paragraph":
    case "heading":
      return INLINE_NODE_TYPES;

    case "codeBlock":
      return new Set(["text"]);

    case "bulletList":
    case "orderedList":
      return new Set(["listItem"]);

    case "taskList":
      return new Set(["taskItem"]);

    case "table":
      return new Set(["tableRow"]);

    case "tableRow":
      return new Set(["tableCell", "tableHeader"]);

    case "text":
    case "hardBreak":
    case "horizontalRule":
      return null;

    default:
      return new Set();
  }
}

function sanitizeNode(value: unknown, expectedTypes: Set<string>): JSONContent | null {
  if (!isPlainObject(value) || typeof value.type !== "string" || !expectedTypes.has(value.type)) {
    return null;
  }

  const type = value.type;

  if (type === "text") {
    if (typeof value.text !== "string") return null;

    return {
      type,
      text: value.text,
      marks: sanitizeMarks(value.marks),
    };
  }

  const childTypes = allowedChildrenFor(type);
  const node: JSONContent = {
    type,
    attrs: sanitizeAttrs(type, value.attrs),
  };

  if (childTypes === null) {
    return value.content === undefined || (Array.isArray(value.content) && value.content.length === 0) ? node : null;
  }

  const mayBeEmpty = type === "paragraph" || type === "heading" || type === "codeBlock";

  if (value.content === undefined) {
    if (type === "doc") {
      return { type: "doc", content: [{ type: "paragraph" }] };
    }
    return mayBeEmpty ? node : null;
  }

  if (!Array.isArray(value.content)) return null;

  const children: JSONContent[] = [];
  for (const child of value.content) {
    const sanitized = sanitizeNode(child, childTypes);
    if (!sanitized) return null;
    children.push(sanitized);
  }

  if (children.length === 0) {
    if (type === "doc") {
      return { type: "doc", content: [{ type: "paragraph" }] };
    }
    return mayBeEmpty ? node : null;
  }

  // Tiptap's list-item and task-item schemas require a paragraph as their
  // first child. Reject malformed stored JSON instead of passing a document
  // that ProseMirror may fail to mount.
  if ((type === "listItem" || type === "taskItem") && children[0]?.type !== "paragraph") {
    return null;
  }

  node.content = children;
  return node;
}

function sanitizeTiptapDocument(value: unknown): JSONContent | null {
  return sanitizeNode(value, new Set(["doc"]));
}

/** Converts legacy plain-text content into paragraph nodes, one per line, preserving blank lines. */
function stringToParagraphs(text: string): JSONContent {
  const lines = text.split(/\r\n|\r|\n/);

  return {
    type: "doc",
    content: lines.map((line) =>
      line.length > 0
        ? { type: "paragraph", content: [{ type: "text", text: line }] }
        : { type: "paragraph" }
    ),
  };
}

/**
 * Normalizes the backend's `content: unknown` field without throwing or
 * silently replacing unsupported structured content. Unsafe link attributes
 * are removed while all text remains intact.
 */
export function normalizeDocumentContent(content: unknown): NormalizedDocumentContent {
  if (content === null || content === undefined) {
    return { editorContent: EMPTY_DOCUMENT_CONTENT, isUnsupportedLegacyContent: false };
  }

  if (typeof content === "string") {
    if (content.trim().length === 0) {
      return { editorContent: EMPTY_DOCUMENT_CONTENT, isUnsupportedLegacyContent: false };
    }

    return { editorContent: stringToParagraphs(content), isUnsupportedLegacyContent: false };
  }

  const sanitized = sanitizeTiptapDocument(content);
  if (sanitized) {
    return { editorContent: sanitized, isUnsupportedLegacyContent: false };
  }

  return { editorContent: EMPTY_DOCUMENT_CONTENT, isUnsupportedLegacyContent: true };
}

export function countWordsAndCharacters(plainText: string): { words: number; characters: number } {
  const trimmed = plainText.trim();
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;

  return { words, characters: plainText.length };
}

export function areDocumentContentsEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
