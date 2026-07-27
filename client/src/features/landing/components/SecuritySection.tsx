import { Cookie, KeyRound, ShieldCheck, UserRoundCheck } from "lucide-react";
import { Reveal } from "./Reveal";

const SECURITY_ITEMS = [
  {
    icon: Cookie,
    title: "HTTP-only authentication",
    description: "Access and refresh tokens remain inaccessible to browser JavaScript and are sent through secure cookie sessions.",
  },
  {
    icon: KeyRound,
    title: "Immediate session revocation",
    description: "Logout, password changes, password resets, and account deletion invalidate previously issued sessions.",
  },
  {
    icon: ShieldCheck,
    title: "Contextual authorization",
    description: "Workspace and project memberships are checked before protected operations and scoped real-time room access.",
  },
  {
    icon: UserRoundCheck,
    title: "Privacy-safe member profiles",
    description: "Read-only member details are available only within a shared workspace or project context.",
  },
] as const;

export function SecuritySection() {
  return (
    <section id="security" className="scroll-mt-20 border-t border-border px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
        <Reveal>
          <span className="text-xs font-medium uppercase tracking-wide text-primary">Security architecture</span>
          <h2 className="mt-3 text-h1 text-foreground">Security is built into every session.</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            SyncSpace applies authentication, authorization, revocation, and privacy controls across HTTP requests and real-time connections.
          </p>

          <div className="mt-7 overflow-hidden rounded-2xl border border-border bg-surface/60">
            <img
              src="/landing/profile.webp"
              alt="SyncSpace profile and account security interface"
              className="h-auto w-full"
              width={1800}
              height={1024}
              loading="lazy"
            />
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {SECURITY_ITEMS.map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delay={index * 70}>
              <article className="h-full rounded-2xl border border-border bg-surface/50 p-5 sm:p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-medium text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
