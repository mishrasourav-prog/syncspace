import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HEADING_OPTIONS = [
  { label: "Paragraph", level: 0 as const },
  { label: "Heading 1", level: 1 as const },
  { label: "Heading 2", level: 2 as const },
  { label: "Heading 3", level: 3 as const },
];

const SAFE_LINK_PROTOCOLS = ["http://", "https://", "mailto:"];

function isSafeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  return SAFE_LINK_PROTOCOLS.some((protocol) => trimmed.toLowerCase().startsWith(protocol));
}

function ToolbarButton({
  label,
  icon: Icon,
  active,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
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
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors",
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
    editor.chain().focus().unsetLink().run();
    setOpen(false);
  }

  if (disabled) {
    return <ToolbarButton label="Link" icon={Link2} disabled onClick={() => {}} />;
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        aria-label="Link"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors",
          "hover:bg-border/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          isActive && "bg-primary/15 text-primary"
        )}
      >
        <Link2 className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <label htmlFor="document-link-url" className="mb-1.5 block text-xs font-medium text-foreground">
          Link URL
        </label>
        <Input
          id="document-link-url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              applyLink();
            }
          }}
        />
        <p className="mt-1 text-[11px] text-muted">Only http, https, and mailto links are allowed.</p>
        <div className="mt-3 flex justify-end gap-2">
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

export function DocumentEditorToolbar({ editor, disabled, isFullscreen, onToggleFullscreen }: DocumentEditorToolbarProps) {
  const activeHeading = HEADING_OPTIONS.find((option) =>
    option.level === 0 ? editor.isActive("paragraph") : editor.isActive("heading", { level: option.level })
  );

  return (
    <div
      role="toolbar"
      aria-label="Document formatting"
      className="flex flex-wrap items-center gap-0.5 overflow-x-auto rounded-t-xl border border-b-0 border-border bg-surface/80 px-2 py-1.5"
    >
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
          className="!w-auto gap-1 px-2 text-xs font-medium text-foreground"
        >
          {activeHeading?.label ?? "Paragraph"}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {HEADING_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.level}
              disabled={disabled}
              onClick={() => {
                if (option.level === 0) {
                  editor.chain().focus().setParagraph().run();
                } else {
                  editor
                    .chain()
                    .focus()
                    .setHeading({ level: option.level as 1 | 2 | 3 })
                    .run();
                }
              }}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolbarDivider />

      <ToolbarButton
        label="Bold"
        icon={Bold}
        active={editor.isActive("bold")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        label="Italic"
        icon={Italic}
        active={editor.isActive("italic")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        label="Underline"
        icon={UnderlineIcon}
        active={editor.isActive("underline")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <ToolbarButton
        label="Strikethrough"
        icon={Strikethrough}
        active={editor.isActive("strike")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <ToolbarButton
        label="Inline code"
        icon={Code}
        active={editor.isActive("code")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleCode().run()}
      />

      <ToolbarDivider />

      <ToolbarButton
        label="Bullet list"
        icon={List}
        active={editor.isActive("bulletList")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        label="Numbered list"
        icon={ListOrdered}
        active={editor.isActive("orderedList")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        label="Task list"
        icon={ListChecks}
        active={editor.isActive("taskList")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      />
      <ToolbarButton
        label="Blockquote"
        icon={Quote}
        active={editor.isActive("blockquote")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />

      <ToolbarDivider />

      <LinkPopover editor={editor} disabled={disabled} />

      <DropdownMenu>
        <DropdownMenuTrigger aria-label="More formatting options">
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem disabled={disabled} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
            <Code2 className="h-3.5 w-3.5" />
            Code block
          </DropdownMenuItem>
          <DropdownMenuItem disabled={disabled} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus className="h-3.5 w-3.5" />
            Horizontal rule
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={disabled}
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
          >
            <Table2 className="h-3.5 w-3.5" />
            Insert table
          </DropdownMenuItem>
          {editor.isActive("table") && (
            <>
              <DropdownMenuItem disabled={disabled} onClick={() => editor.chain().focus().addRowAfter().run()}>
                Add row
              </DropdownMenuItem>
              <DropdownMenuItem disabled={disabled} onClick={() => editor.chain().focus().deleteRow().run()}>
                Delete row
              </DropdownMenuItem>
              <DropdownMenuItem disabled={disabled} onClick={() => editor.chain().focus().addColumnAfter().run()}>
                Add column
              </DropdownMenuItem>
              <DropdownMenuItem disabled={disabled} onClick={() => editor.chain().focus().deleteColumn().run()}>
                Delete column
              </DropdownMenuItem>
              <DropdownMenuItem disabled={disabled} onClick={() => editor.chain().focus().deleteTable().run()}>
                Delete table
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center">
        <ToolbarButton
          label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          icon={isFullscreen ? Minimize2 : Maximize2}
          onClick={onToggleFullscreen}
        />
      </div>
    </div>
  );
}
