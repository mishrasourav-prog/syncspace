import { Reveal } from "./Reveal";

const SECURITY_ITEMS = [
  {
    title: "HTTP-only authentication",
    description:
      "Access and refresh tokens remain inaccessible to browser JavaScript and are sent through secure cookie sessions.",
  },
  {
    title: "Immediate session revocation",
    description:
      "Logout, password changes, password resets, and account deletion invalidate previously issued sessions.",
  },
  {
    title: "Contextual authorization",
    description:
      "Workspace and project memberships are checked before protected operations and scoped realtime room access.",
  },
  {
    title: "Privacy-safe member profiles",
    description: "Read-only member details are available only within a shared workspace or project context.",
  },
] as const;

export function SecuritySection() {
  return (
    <section id="security" className="scroll-mt-20 border-t border-border px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
        <Reveal>
          <h2 className="text-h1 text-foreground">Access stays tied to the workspace and project.</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            SyncSpace applies authentication, authorization, revocation, and privacy controls across HTTP
            requests and realtime connections.
          </p>

          <div className="mt-7 overflow-hidden rounded-lg border border-border bg-surface">
            <img
              src="/landing/profile.png"
              alt="SyncSpace profile and account security interface"
              className="h-auto w-full"
              width={1800}
              height={1024}
              loading="lazy"
            />
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="flex flex-col divide-y divide-border border-y border-border">
            {SECURITY_ITEMS.map(({ title, description }) => (
              <div key={title} className="py-5">
                <h3 className="text-sm font-medium text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
