import { Reveal } from "../header & hero/Reveal";

const STEPS = [
  { n: "01", title: "Create a workspace", desc: "Spin up a dedicated space for your team or project in seconds." },
  { n: "02", title: "Bring your team", desc: "Invite teammates and pick up right where conversations left off." },
  { n: "03", title: "Build together", desc: "Move from idea to shipped work across canvas, boards, and docs." },
];

export function HowItWorks() {
  return (
    <section className="py-28 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <Reveal className="max-w-xl mb-16">
          <span className="text-xs font-medium text-primary tracking-wide uppercase">How it works</span>
          <h2 className="mt-3 text-h1 text-foreground">From blank canvas to shipped work.</h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="text-5xl font-semibold text-border mb-4">{s.n}</div>
              <h3 className="text-foreground font-medium text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted leading-relaxed max-w-xs">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}