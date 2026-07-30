import { Reveal } from "./Reveal";

const STEPS = [
  {
    number: "01",
    title: "Create a workspace",
    description: "Start a dedicated team space and set its context.",
  },
  {
    number: "02",
    title: "Invite your team and create projects",
    description: "Bring teammates in and organize access through roles.",
  },
  {
    number: "03",
    title: "Run tasks, documents, and discussions together",
    description:
      "Track work, write knowledge, and discuss decisions in one place.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="workflow"
      className="scroll-mt-20 border-t border-border px-4 py-16 sm:px-6 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-4xl">
        <Reveal className="mb-10 max-w-xl sm:mb-12">
          <h2 className="text-h1 text-foreground">
            From workspace setup to project delivery.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            SyncSpace uses a simple hierarchy so every task, document,
            discussion, and member action stays in the right context.
          </p>
        </Reveal>

        <div className="flex flex-col divide-y divide-border border-y border-border">
          {STEPS.map(({ number, title, description }, index) => (
            <Reveal
              key={number}
              delay={index * 60}
              className="flex items-start gap-5 py-5 sm:gap-6 sm:py-6"
            >
              <span className="text-sm font-medium text-muted">{number}</span>
              <div>
                <h3 className="text-base font-medium text-foreground">
                  {title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
