import { Bot, Zap, Search, Plus, type LucideIcon } from "lucide-react";
import { Reveal } from "../header & hero/Reveal";

interface AIFeatureItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const AI_FEATURES: AIFeatureItem[] = [
  { icon: Bot, title: "Smart summaries", desc: "AI condenses long threads and docs into a two-line summary you can trust." },
  { icon: Zap, title: "Auto-generated tasks", desc: "Turn a messy meeting note into a structured, assignable task list instantly." },
  { icon: Search, title: "Workspace-wide search", desc: "Ask a question and get answers pulled from docs, tasks, and canvas notes." },
];

export function AIFeatures() {
  return (
    <section className="py-28 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <Reveal>
          <span className="text-xs font-medium text-primary tracking-wide uppercase">AI features</span>
          <h2 className="mt-3 text-h1 text-foreground leading-tight">
            An assistant that already knows your workspace.
          </h2>
          <div className="mt-10 flex flex-col gap-8">
            {AI_FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground font-medium mb-1">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-elevated">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground">SyncSpace AI</span>
            </div>
            <div className="rounded-xl bg-background border border-border p-4 mb-3">
              <p className="text-sm text-foreground/80 leading-relaxed">
                Summarize the "Q3 Launch" discussion and list open action items.
              </p>
            </div>
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
              <p className="text-xs text-primary/90 leading-relaxed mb-3">
                Three decisions were made and two items remain open — assigned below.
              </p>
              <div className="flex flex-col gap-2">
                {["Finalize pricing copy", "Confirm launch date"].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-xs text-foreground/80 bg-surface border border-border rounded-lg px-3 py-2">
                    <Plus className="w-3 h-3 text-muted" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}