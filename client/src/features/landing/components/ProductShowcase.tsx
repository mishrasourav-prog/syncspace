import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, FolderKanban, KanbanSquare, MessageSquareText, type LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";

type ShowcaseId = "workspace" | "tasks" | "documents" | "discussions";

interface ShowcaseItem {
  id: ShowcaseId;
  label: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  icon: LucideIcon;
  width: number;
  height: number;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "workspace",
    label: "Workspace",
    title: "Manage projects, members, access, and activity.",
    description:
      "Workspace overviews connect projects, memberships, roles, invitations, access details, and recent activity in one place.",
    image: "/landing/workspace-overview.webp",
    alt: "SyncSpace workspace overview showing projects, members, access information, and activity",
    icon: FolderKanban,
    width: 1800,
    height: 1033,
  },
  {
    id: "tasks",
    label: "Tasks & Issues",
    title: "Move work through a clear project workflow.",
    description:
      "Use board or list views with filters, priorities, assignees, due dates, comments, and status-based organization.",
    image: "/landing/tasks-and-issues.webp",
    alt: "SyncSpace tasks and issues Kanban board with filters and project summary",
    icon: KanbanSquare,
    width: 1800,
    height: 1035,
  },
  {
    id: "documents",
    label: "Documents",
    title: "Keep project knowledge beside the work.",
    description:
      "Write rich documents with revisions, preview, duplication, export, archive, and restore controls.",
    image: "/landing/document-editor.webp",
    alt: "SyncSpace rich-text project document editor",
    icon: FileText,
    width: 1800,
    height: 1032,
  },
  {
    id: "discussions",
    label: "Discussions",
    title: "Keep project decisions visible and searchable.",
    description:
      "Use threaded discussions, replies, participants, moderation, metadata, and recent activity without leaving the project.",
    image: "/landing/discussions.webp",
    alt: "SyncSpace project discussions with replies, participants, and activity",
    icon: MessageSquareText,
    width: 1800,
    height: 1036,
  },
];

export function ProductShowcase() {
  const [activeId, setActiveId] = useState<ShowcaseId>("workspace");
  const activeItem = SHOWCASE_ITEMS.find((item) => item.id === activeId) ?? SHOWCASE_ITEMS[0];

  return (
    <section id="product" className="scroll-mt-20 border-t border-border px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-medium uppercase tracking-wide text-secondary">Product experience</span>
          <h2 className="mt-3 text-h1 text-foreground">Switch project surfaces without losing context.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            These are real interfaces from the current application—not conceptual mockups or future features.
          </p>
        </Reveal>

        <Reveal delay={90}>
          <div className="mx-auto mt-8 grid w-full max-w-3xl grid-cols-2 gap-2 sm:mt-10 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center">
            {SHOWCASE_ITEMS.map(({ id, label, icon: Icon }) => {
              const isActive = activeId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveId(id)}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:px-4 ${
                    isActive
                      ? "border-primary/40 bg-primary text-primary-foreground"
                      : "border-border bg-surface/60 text-muted hover:bg-surface hover:text-foreground"
                  }`}
                  aria-pressed={isActive}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={150} className="mt-6 sm:mt-8">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 overflow-hidden border-b border-border lg:border-b-0 lg:border-r">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={activeItem.id}
                    src={activeItem.image}
                    alt={activeItem.alt}
                    className="h-auto w-full"
                    width={activeItem.width}
                    height={activeItem.height}
                    initial={{ opacity: 0, scale: 0.995 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    loading="lazy"
                  />
                </AnimatePresence>
              </div>

              <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-8">
                <span className="text-xs font-medium uppercase tracking-wide text-primary">{activeItem.label}</span>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">{activeItem.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{activeItem.description}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
