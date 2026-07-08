import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Kanban, GitBranch } from "lucide-react";
import { Reveal } from "../header & hero/Reveal";

type PreviewTab = "canvas" | "board" | "timeline";

const TABS: { id: PreviewTab; label: string; icon: typeof Layers }[] = [
  { id: "canvas", label: "Canvas", icon: Layers },
  { id: "board", label: "Board", icon: Kanban },
  { id: "timeline", label: "Timeline", icon: GitBranch },
];

const CANVAS_NODES = ["User Flow", "Design System", "Copy Doc", "Research"];
const BOARD_COLUMNS = [
  { label: "To Do", count: 3 },
  { label: "In Progress", count: 2 },
  { label: "Done", count: 1 },
];
const TIMELINE_ROWS = [
  { label: "Design", width: "40%", colorClass: "bg-primary/60" },
  { label: "Research", width: "25%", colorClass: "bg-secondary/60" },
  { label: "Launch", width: "60%", colorClass: "bg-success/60" },
];

export function WorkspacePreview() {
  const [tab, setTab] = useState<PreviewTab>("canvas");

  return (
    <section className="py-28 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto text-center">
        <Reveal>
          <span className="text-xs font-medium text-secondary tracking-wide uppercase">Workspace preview</span>
          <h2 className="mt-3 text-h1 text-foreground">Switch views without switching tools.</h2>
          <p className="mt-4 text-muted max-w-lg mx-auto">
            Every workspace ships with canvas, board, and timeline views of the same underlying work.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="inline-flex mt-10 mb-8 p-1 rounded-xl border border-border bg-surface/60">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  tab === id ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="rounded-2xl border border-border bg-surface shadow-elevated overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border">
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
            </div>

            <AnimatePresence mode="wait">
              {tab === "canvas" && (
                <motion.div
                  key="canvas"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-72 sm:h-96 relative p-8"
                >
                  {CANVAS_NODES.map((t, i) => (
                    <div
                      key={t}
                      className="absolute w-36 rounded-lg border border-border bg-background/80 p-3"
                      style={{ top: `${20 + (i % 2) * 40}%`, left: `${10 + i * 20}%` }}
                    >
                      <div className="text-xs font-medium text-foreground mb-1">{t}</div>
                      <div className="h-1.5 w-3/4 rounded bg-border" />
                    </div>
                  ))}
                </motion.div>
              )}

              {tab === "board" && (
                <motion.div
                  key="board"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-72 sm:h-96 p-6 flex gap-4 overflow-hidden"
                >
                  {BOARD_COLUMNS.map((col) => (
                    <div key={col.label} className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-muted mb-3">{col.label}</div>
                      <div className="flex flex-col gap-2">
                        {Array.from({ length: col.count }).map((_, i) => (
                          <div key={i} className="rounded-lg border border-border bg-background/80 p-3">
                            <div className="h-1.5 w-2/3 rounded bg-border mb-2" />
                            <div className="h-1.5 w-1/3 rounded bg-border/60" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {tab === "timeline" && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-72 sm:h-96 p-6"
                >
                  <div className="flex flex-col gap-4 mt-6">
                    {TIMELINE_ROWS.map((row) => (
                      <div key={row.label} className="flex items-center gap-3">
                        <span className="w-20 text-xs text-muted text-left shrink-0">{row.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                          <div className={`h-full rounded-full ${row.colorClass}`} style={{ width: row.width }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}