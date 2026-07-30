import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

interface HeroProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

export function Hero({ onGetStarted, onLogin }: HeroProps) {
  return (
    <section
      id="top"
      className="border-b border-border px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:pb-24 lg:pt-36"
    >
      <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
        <Reveal>
          <h1 className="text-display text-foreground">
            Keep every project moving from one shared workspace.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            SyncSpace brings tasks, issues, documents, discussions, members, and
            notifications together, so your team always works with the same
            project context.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={onGetStarted}
            >
              Create your workspace
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={onLogin}
            >
              Log in
            </Button>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-soft">
            <div
              className="flex items-center gap-1.5 border-b border-border px-4 py-2.5"
              aria-hidden="true"
            >
              <span className="h-2 w-2 rounded-full bg-muted/40" />
              <span className="h-2 w-2 rounded-full bg-muted/40" />
              <span className="h-2 w-2 rounded-full bg-muted/40" />
              <span className="ml-2 truncate text-[11px] text-muted">
                SyncSpace workspace dashboard
              </span>
            </div>
            <img
              src="/landing/dashboard.png"
              alt="SyncSpace workspace dashboard showing workspace statistics, quick actions, and project navigation"
              className="h-auto w-full"
              width={1800}
              height={1027}
              fetchPriority="high"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
