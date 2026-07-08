import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceMockup } from "./WorkspaceMockup";
import { Reveal } from "./Reveal";

const TRUSTED_BY = ["Northwind", "Vantage", "Loopline", "Fabrik", "Astra Labs"];

interface HeroProps {
  onGetStarted?: () => void;
  onViewDemo?: () => void;
}

export function Hero({ onGetStarted, onViewDemo }: HeroProps) {
  return (
    <section className="relative pt-40 pb-28 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-7"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI-powered workspace
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-display text-foreground"
        >
          Everything your team needs.
          <br />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            One intelligent workspace.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mt-6 text-lg text-muted max-w-2xl mx-auto leading-relaxed"
        >
          Brainstorm on an infinite canvas, plan on a timeline, and ship from a
          board — SyncSpace keeps ideas, tasks, and people in sync without
          breaking your flow.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button size="lg" onClick={onGetStarted}>
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="lg" onClick={onViewDemo}>
            <Play className="w-3.5 h-3.5" />
            View Demo
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="mt-6 text-xs text-muted/70"
        >
          No credit card required · Free for teams up to 10
        </motion.p>
      </div>

      <Reveal delay={200} className="mt-20">
        <WorkspaceMockup />
      </Reveal>

      <Reveal delay={280}>
        <div className="mt-24 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
          {TRUSTED_BY.map((name) => (
            <span key={name} className="text-sm font-medium text-muted tracking-wide">
              {name}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}