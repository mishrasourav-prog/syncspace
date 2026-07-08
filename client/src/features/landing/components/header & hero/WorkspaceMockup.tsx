import { motion } from "framer-motion";
import {
  Circle,
  LayoutDashboard,
  Layers,
  Kanban,
  GitBranch,
  FileText,
  Bot,
  CheckCircle2,
} from "lucide-react";

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: Layers, label: "Canvas", active: true },
  { icon: Kanban, label: "Tasks" },
  { icon: GitBranch, label: "Timeline" },
  { icon: FileText, label: "Docs" },
];

export function WorkspaceMockup() {
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div
        className="absolute -inset-24 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(closest-side, hsl(var(--primary) / 0.25), transparent)" }}
        aria-hidden
      />

      <div className="relative rounded-2xl border border-border bg-surface shadow-elevated overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-surface/80">
          <span className="w-2.5 h-2.5 rounded-full bg-border" />
          <span className="w-2.5 h-2.5 rounded-full bg-border" />
          <span className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="ml-3 flex items-center gap-1.5 text-[11px] text-muted bg-background px-3 py-1 rounded-md border border-border">
            <Circle className="w-2 h-2 fill-success text-success" />
            app.syncspace.io/design-system
          </div>
        </div>

        <div className="flex h-72 sm:h-80">
          <div className="hidden sm:flex w-40 flex-col border-r border-border bg-background/60 p-3 gap-1">
            <div className="text-[10px] uppercase tracking-wider text-muted/70 px-2 mb-1">Workspace</div>
            {SIDEBAR_ITEMS.map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs ${
                  active ? "bg-primary/15 text-primary" : "text-muted"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
            ))}
          </div>

          <div
            className="flex-1 relative bg-surface"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          >
            <div className="absolute top-6 left-6 w-32 rounded-lg border border-secondary/30 bg-secondary/10 p-2.5">
              <div className="text-[10px] font-medium text-secondary mb-1">User Flow</div>
              <div className="h-1.5 w-3/4 rounded bg-secondary/30 mb-1" />
              <div className="h-1.5 w-1/2 rounded bg-secondary/30" />
            </div>
            <div className="absolute top-8 left-44 w-28 rounded-lg border border-primary/30 bg-primary/10 p-2.5">
              <div className="text-[10px] font-medium text-primary mb-1">Design System</div>
              <div className="h-1.5 w-2/3 rounded bg-primary/30" />
            </div>
            <div className="absolute bottom-8 left-16 w-32 rounded-lg border border-success/30 bg-success/10 p-2.5">
              <div className="text-[10px] font-medium text-success mb-1">Handoff Notes</div>
              <div className="h-1.5 w-3/4 rounded bg-success/30 mb-1" />
              <div className="h-1.5 w-1/3 rounded bg-success/30" />
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="hidden sm:flex absolute -top-6 -right-6 w-48 rounded-xl border border-border bg-surface shadow-elevated p-3 items-start gap-2 animate-float"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
          <Bot className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <div className="text-[11px] font-medium text-foreground">AI Suggestion</div>
          <div className="text-[10px] text-muted leading-relaxed">
            Group these 4 notes into "Onboarding"?
          </div>
        </div>
      </motion.div>

      <motion.div
        className="hidden sm:flex absolute -bottom-8 -left-8 w-44 rounded-xl border border-border bg-surface shadow-elevated p-3 items-center gap-2"
        style={{ animationDelay: "1.2s" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.65 }}
      >
        <span className="animate-float flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
          <span className="text-[11px] text-foreground/80">"Wireframes" marked done</span>
        </span>
      </motion.div>

      <motion.div
        className="hidden sm:flex absolute bottom-10 right-0 translate-x-1/3 rounded-full border border-border bg-surface shadow-elevated px-2.5 py-1.5 items-center gap-1.5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="flex -space-x-2">
          <div className="w-5 h-5 rounded-full bg-primary border-2 border-surface" />
          <div className="w-5 h-5 rounded-full bg-secondary border-2 border-surface" />
          <div className="w-5 h-5 rounded-full bg-success border-2 border-surface" />
        </div>
        <span className="text-[10px] text-muted pr-1">+3 online</span>
      </motion.div>
    </div>
  );
}