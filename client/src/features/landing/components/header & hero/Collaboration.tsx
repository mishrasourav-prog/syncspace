import { Users, MessageSquare, Bell } from "lucide-react";
import { Reveal } from "../header & hero/Reveal";

const COLLAB_POINTS = [
  { icon: Users, text: "See who's viewing and editing in real time" },
  { icon: MessageSquare, text: "Comment directly on canvas, docs, or tasks" },
  { icon: Bell, text: "Get notified only when it matters" },
];

export function Collaboration() {
  return (
    <section className="py-28 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <Reveal className="order-2 lg:order-1">
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-elevated">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-foreground">Design System</span>
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-primary border-2 border-surface" />
                <div className="w-7 h-7 rounded-full bg-secondary border-2 border-surface" />
                <div className="w-7 h-7 rounded-full bg-success border-2 border-surface" />
                <div className="w-7 h-7 rounded-full bg-warning border-2 border-surface" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                Priya is editing "Color tokens"
              </div>
              <div className="rounded-lg border border-border bg-background p-3 relative">
                <div className="h-1.5 w-3/4 rounded bg-border mb-2" />
                <div className="h-1.5 w-1/2 rounded bg-border/60" />
                <div className="absolute -right-2 -top-2 flex items-center gap-1 bg-secondary text-white text-[10px] px-2 py-0.5 rounded-full">
                  <MessageSquare className="w-2.5 h-2.5" />
                  Priya
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Amit commented on "Spacing scale"
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100} className="order-1 lg:order-2">
          <span className="text-xs font-medium text-secondary tracking-wide uppercase">Collaboration</span>
          <h2 className="mt-3 text-h1 text-foreground leading-tight">
            Work together like you're in the same room.
          </h2>
          <p className="mt-4 text-muted leading-relaxed max-w-md">
            Live cursors, inline comments, and @mentions mean nothing gets lost
            between the idea and the outcome.
          </p>
          <div className="mt-8 flex flex-col gap-4">
            {COLLAB_POINTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-secondary shrink-0" />
                <span className="text-sm text-foreground/80">{text}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}