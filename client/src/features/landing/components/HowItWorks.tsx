import { FolderPlus, ListChecks, UserRoundPlus } from "lucide-react";
import { Reveal } from "./Reveal";

const STEPS = [
  {
    number: "01",
    icon: FolderPlus,
    title: "Create a workspace",
    description: "Start a dedicated team space, set its context, and create focused projects inside it.",
  },
  {
    number: "02",
    icon: UserRoundPlus,
    title: "Invite and organize your team",
    description: "Invite teammates and control workspace or project access through contextual roles.",
  },
  {
    number: "03",
    icon: ListChecks,
    title: "Run the project work",
    description: "Track tasks, write documents, discuss decisions, and follow activity from one connected interface.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="workflow" className="scroll-mt-20 border-t border-border px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-10 max-w-2xl sm:mb-14">
          <span className="text-xs font-medium uppercase tracking-wide text-primary">How it works</span>
          <h2 className="mt-3 text-h1 text-foreground">From workspace setup to project delivery.</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            SyncSpace uses a simple hierarchy so every task, document, discussion, and member action stays in the right context.
          </p>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {STEPS.map(({ number, icon: Icon, title, description }, index) => (
            <Reveal key={number} delay={index * 90}>
              <article className="relative h-full overflow-hidden rounded-2xl border border-border bg-surface/50 p-5 sm:p-6">
                <span className="absolute right-4 top-3 text-5xl font-semibold text-border/60" aria-hidden="true">
                  {number}
                </span>
                <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-medium text-foreground">{title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
