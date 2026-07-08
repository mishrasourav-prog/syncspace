import { Star } from "lucide-react";
import { Reveal } from "../header & hero/Reveal";

interface Testimonial {
  name: string;
  role: string;
  text: string;
}

const TESTIMONIALS: Testimonial[] = [
  { name: "Maya Chen", role: "Head of Product, Loopline", text: "SyncSpace replaced four tools on our team. The canvas-to-board handoff alone saved us hours every week." },
  { name: "Daniel Osei", role: "Engineering Lead, Vantage", text: "The AI summaries are scary good. I stopped reading half our Slack threads and just ask SyncSpace instead." },
  { name: "Sara Lindqvist", role: "Design Director, Fabrik", text: "It's the first tool that actually feels designed for how creative teams think — not another spreadsheet." },
];

export function Testimonials() {
  return (
    <section className="py-28 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <Reveal className="max-w-xl mb-16">
          <span className="text-xs font-medium text-success tracking-wide uppercase">Testimonials</span>
          <h2 className="mt-3 text-h1 text-foreground">Loved by fast-moving teams.</h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div className="h-full rounded-2xl border border-border bg-surface/50 p-6 hover:border-muted/40 transition-colors duration-300">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary" />
                  <div>
                    <div className="text-sm font-medium text-foreground">{t.name}</div>
                    <div className="text-xs text-muted">{t.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}