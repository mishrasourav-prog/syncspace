import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, CheckCircle2, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

interface HeroProps {
  onGetStarted?: () => void;
}

const CAPABILITIES = [
  "Workspaces",
  "Projects",
  "Tasks & Issues",
  "Documents",
  "Discussions",
  "Notifications",
] as const;

export function Hero({ onGetStarted }: HeroProps) {
  const exploreFeatures = (): void => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="top" className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:pb-28 lg:pt-40">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[34rem] w-[min(68rem,100vw)] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, hsl(var(--primary) / 0.14), transparent 72%)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
        >
          <Radio className="h-3.5 w-3.5" />
          Real-time team workspace
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06 }}
          className="text-display text-foreground"
        >
          <span className="block">Plan work. Share knowledge.</span>
          <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Stay in sync.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-muted sm:text-lg"
        >
          Organize teams into workspaces, run focused projects, track tasks and issues, write project documents,
          and keep every discussion connected to the work.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center"
        >
          <Button size="lg" className="w-full sm:w-auto" onClick={onGetStarted}>
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={exploreFeatures}>
            Explore Features
            <ArrowDown className="h-4 w-4" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted"
        >
          {["Role-based access", "Scoped real-time updates", "Secure account sessions"].map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      <Reveal delay={160} className="relative mx-auto mt-12 max-w-7xl sm:mt-16 lg:mt-20">
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-elevated sm:rounded-2xl">
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-3" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
            <span className="ml-3 truncate text-[11px] text-muted">SyncSpace workspace dashboard</span>
          </div>
          <img
            src="/landing/dashboard.webp"
            alt="SyncSpace workspace dashboard showing workspace statistics, quick actions, and project navigation"
            className="h-auto w-full"
            width={1800}
            height={1027}
            fetchPriority="high"
          />
        </div>
      </Reveal>

      <Reveal delay={220}>
        <div className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-center gap-2 sm:mt-12 sm:gap-3">
          {CAPABILITIES.map((item) => (
            <span key={item} className="rounded-full border border-border bg-surface/70 px-3 py-1.5 text-xs text-muted sm:px-4">
              {item}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
