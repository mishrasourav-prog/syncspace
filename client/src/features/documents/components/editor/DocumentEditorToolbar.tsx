import { useState, type ComponentType, type MouseEvent } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Code,
  Code2,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Maximize2,
  Minimize2,
  Minus,
  MoreHorizontal,
  Quote,
  Redo2,
  Strikethrough,
  Table2,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const HEADING_OPTIONS = [
  { label: "Paragraph", level: 0 as const },
  { label: "Heading 1", level: 1 as const },
  { label: "Heading 2", level: 2 as const },
  { label: "Heading 3", level: 3 as const },
];

const SAFE_LINK_PROTOCOLS = ["http://", "https://", "mailto:"];

function isSafeUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  return SAFE_LINK_PROTOCOLS.some((protocol) => trimmed.startsWith(protocol));
}

function preserveEditorSelection(event: MouseEvent<HTMLElement>): void {
  event.preventDefault();
}

function ToolbarButton({
  label,
  icon: Icon,
  active,
  disabled,
  onClick,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={preserveEditorSelection}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted transition-colors",
        "hover:bg-border/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        "disabled:pointer-events-none disabled:opacity-40",
        active && "bg-primary/15 text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function ToolbarDivider() {
  return <span aria-hidden className="mx-0.5 h-5 w-px shrink-0 bg-border" />;
}

function LinkPopover({ editor, disabled }: { editor: Editor; disabled: boolean }) {
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);
  const isActive = editor.isActive("link");

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setUrl((editor.getAttributes("link").href as string | undefined) ?? "");
    }
  }

  function applyLink() {
    if (!isSafeUrl(url)) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    setOpen(false);
  }

  function removeLink() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setOpen(false);
  }

  if (disabled) {
    return <ToolbarButton label="Add or edit link" icon={Link2} disabled onClick={() => undefined} />;
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        aria-label="Add or edit link"
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted transition-colors",
          "hover:bg-border/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          isActive && "bg-primary/15 text-primary"
        )}
      >
        <Link2 className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent className="w-[min(18rem,calc(100vw-2rem))]">
        <label htmlFor="document-link-url" className="mb-1.5 block text-xs font-medium text-foreground">
          Link URL
        </label>
        <Input
          id="document-link-url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com"
          inputMode="url"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              applyLink();
            }
          }}
        />
        <p className="mt-1 text-[11px] text-muted">Only http, https, and mailto links are allowed.</p>
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          {isActive && (
            <Button type="button" size="sm" variant="secondary" onClick={removeLink}>
              <Unlink className="h-3.5 w-3.5" />
              Remove
            </Button>
          )}
          <Button type="button" size="sm" onClick={applyLink} disabled={!isSafeUrl(url)}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface DocumentEditorToolbarProps {
  editor: Editor;
  disabled: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function DocumentEditorToolbar({
  editor,
  disabled,
  isFullscreen,
  onToggleFullscreen,
}: DocumentEditorToolbarProps) {
  const activeHeading = HEADING_OPTIONS.find((option) =>
    option.level === 0
      ? editor.isActive("paragraph")
      : editor.isActive("heading", { level: option.level })
  );

  const can = {
    paragraph: editor.can().chain().focus().setParagraph().run(),
    h1: editor.can().chain().focus().setHeading({ level: 1 }).run(),
    h2: editor.can().chain().focus().setHeading({ level: 2 }).run(),
    h3: editor.can().chain().focus().setHeading({ level: 3 }).run(),
    bold: editor.can().chain().focus().toggleBold().run(),
    italic: editor.can().chain().focus().toggleItalic().run(),
    underline: editor.can().chain().focus().toggleUnderline().run(),
    strike: editor.can().chain().focus().toggleStrike().run(),
    code: editor.can().chain().focus().toggleCode().run(),
    bulletList: editor.can().chain().focus().toggleBulletList().run(),
    orderedList: editor.can().chain().focus().toggleOrderedList().run(),
    taskList: editor.can().chain().focus().toggleTaskList().run(),
    blockquote: editor.can().chain().focus().toggleBlockquote().run(),
    codeBlock: editor.can().chain().focus().toggleCodeBlock().run(),
    horizontalRule: editor.can().chain().focus().setHorizontalRule().run(),
    insertTable: editor.can().chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    addRow: editor.can().chain().focus().addRowAfter().run(),
    deleteRow: editor.can().chain().focus().deleteRow().run(),
    addColumn: editor.can().chain().focus().addColumnAfter().run(),
    deleteColumn: editor.can().chain().focus().deleteColumn().run(),
    mergeCells: editor.can().chain().focus().mergeCells().run(),
    splitCell: editor.can().chain().focus().splitCell().run(),
    toggleHeaderRow: editor.can().chain().focus().toggleHeaderRow().run(),
    deleteTable: editor.can().chain().focus().deleteTable().run(),
  };

  return (
    <div
      role="toolbar"
      aria-label="Document formatting"
      className="min-w-0 overflow-x-auto rounded-t-xl border border-b-0 border-border bg-surface/80"
    >
      <div className="flex min-w-max items-center gap-0.5 px-2 py-1.5">
        <ToolbarButton
          label="Undo"
          icon={Undo2}
          disabled={disabled || !editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          label="Redo"
          icon={Redo2}
          disabled={disabled || !editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        />

        <ToolbarDivider />

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Paragraph style"
            className="!w-auto min-w-24 gap-1 px-2 text-xs font-medium text-foreground"
          >
            {activeHeading?.label ?? "Paragraph"}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {HEADING_OPTIONS.map((option) => {
              const commandAvailable =
                option.level === 0 ? can.paragraph : can[`h${option.level}` as "h1" | "h2" | "h3"];

              return (
                <DropdownMenuItem
                  key={option.level}
                  disabled={disabled || !commandAvailable}
                  onClick={() => {
                    if (option.level === 0) {
                      editor.chain().focus().setParagraph().run();
                    } else {
                      editor.chain().focus().setHeading({ level: option.level }).run();
                    }
                  }}
                >
                  {option.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <ToolbarDivider />

        <ToolbarButton label="Bold" icon={Bold} active={editor.isActive("bold")} disabled={disabled || !can.bold} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarButton label="Italic" icon={Italic} active={editor.isActive("italic")} disabled={disabled || !can.italic} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarButton label="Underline" icon={UnderlineIcon} active={editor.isActive("underline")} disabled={disabled || !can.underline} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <ToolbarButton label="Strikethrough" icon={Strikethrough} active={editor.isActive("strike")} disabled={disabled || !can.strike} onClick={() => editor.chain().focus().toggleStrike().run()} />
        <ToolbarButton label="Inline code" icon={Code} active={editor.isActive("code")} disabled={disabled || !can.code} onClick={() => editor.chain().focus().toggleCode().run()} />

        <ToolbarDivider />

        <ToolbarButton label="Bullet list" icon={List} active={editor.isActive("bulletList")} disabled={disabled || !can.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarButton label="Numbered list" icon={ListOrdered} active={editor.isActive("orderedList")} disabled={disabled || !can.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton label="Task list" icon={ListChecks} active={editor.isActive("taskList")} disabled={disabled || !can.taskList} onClick={() => editor.chain().focus().toggleTaskList().run()} />
        <ToolbarButton label="Blockquote" icon={Quote} active={editor.isActive("blockquote")} disabled={disabled || !can.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()} />

        <ToolbarDivider />
        <LinkPopover editor={editor} disabled={disabled} />

        <DropdownMenu>
          <DropdownMenuTrigger aria-label="More formatting options">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-[min(70vh,30rem)] overflow-y-auto">
            <DropdownMenuItem disabled={disabled || !can.codeBlock} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
              <Code2 className="h-3.5 w-3.5" />
              Code block
            </DropdownMenuItem>
            <DropdownMenuItem disabled={disabled || !can.horizontalRule} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
              <Minus className="h-3.5 w-3.5" />
              Horizontal rule
            </DropdownMenuItem>
            <DropdownMenuItem disabled={disabled || !can.insertTable} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
              <Table2 className="h-3.5 w-3.5" />
              Insert 3 × 3 table
            </DropdownMenuItem>

            {editor.isActive("table") && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={disabled || !can.addRow} onClick={() => editor.chain().focus().addRowAfter().run()}>
                  Add row below
                </DropdownMenuItem>
                <DropdownMenuItem disabled={disabled || !can.deleteRow} onClick={() => editor.chain().focus().deleteRow().run()}>
                  Delete current row
                </DropdownMenuItem>
                <DropdownMenuItem disabled={disabled || !can.addColumn} onClick={() => editor.chain().focus().addColumnAfter().run()}>
                  Add column after
                </DropdownMenuItem>
                <DropdownMenuItem disabled={disabled || !can.deleteColumn} onClick={() => editor.chain().focus().deleteColumn().run()}>
                  Delete current column
                </DropdownMenuItem>
                <DropdownMenuItem disabled={disabled || !can.mergeCells} onClick={() => editor.chain().focus().mergeCells().run()}>
                  Merge selected cells
                </DropdownMenuItem>
                <DropdownMenuItem disabled={disabled || !can.splitCell} onClick={() => editor.chain().focus().splitCell().run()}>
                  Split current cell
                </DropdownMenuItem>
                <DropdownMenuItem disabled={disabled || !can.toggleHeaderRow} onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
                  Toggle header row
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="danger" disabled={disabled || !can.deleteTable} onClick={() => editor.chain().focus().deleteTable().run()}>
                  Delete table
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <ToolbarDivider />
        <ToolbarButton
          label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          icon={isFullscreen ? Minimize2 : Maximize2}
          onClick={onToggleFullscreen}
        />
      </div>
    </div>
  );
}
