import { Layers, Kanban, GitBranch, FileText, Users, Bot, type LucideIcon } from "lucide-react";
import { Reveal } from "../header & hero/Reveal";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  colorClass: string;
}

const FEATURES: Feature[] = [
  { icon: Layers, title: "Visual Canvas", desc: "An infinite canvas for mapping ideas, flows, and systems — with your team, live.", colorClass: "text-primary bg-primary/10" },
  { icon: Kanban, title: "Task Boards", desc: "Kanban boards that stay in sync with timelines, docs, and canvas nodes automatically.", colorClass: "text-secondary bg-secondary/10" },
  { icon: GitBranch, title: "Timelines & Roadmaps", desc: "Plan releases and campaigns on a roadmap that updates itself as work moves.", colorClass: "text-success bg-success/10" },
  { icon: FileText, title: "Docs & Wikis", desc: "Write specs and knowledge docs that link directly into tasks and canvas boards.", colorClass: "text-warning bg-warning/10" },
  { icon: Users, title: "Real-time Collaboration", desc: "See teammates' cursors, edits, and comments the instant they happen.", colorClass: "text-primary bg-primary/10" },
  { icon: Bot, title: "AI Assistant", desc: "Summarize threads, generate tasks from notes, and search your whole workspace.", colorClass: "text-secondary bg-secondary/10" },
];

export function Features() {
  return (
    <section className="py-28 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <Reveal className="max-w-xl mb-16">
          <span className="text-xs font-medium text-secondary tracking-wide uppercase">Features</span>
          <h2 className="mt-3 text-h1 text-foreground">
            One workspace, every surface your team actually uses.
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, colorClass }, i) => (
            <Reveal key={title} delay={i * 60}>
              <div className="h-full rounded-2xl border border-border bg-surface/50 p-6 hover:border-muted/40 hover:bg-surface transition-colors duration-300">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-foreground font-medium mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}