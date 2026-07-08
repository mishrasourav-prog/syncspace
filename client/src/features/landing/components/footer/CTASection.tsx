import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "../header & hero/Reveal";

interface CTASectionProps {
  onGetStarted?: () => void;
  onViewDemo?: () => void;
}

export function CTASection({ onGetStarted, onViewDemo }: CTASectionProps) {
  return (
    <section className="py-24 px-6 border-t border-border">
      <Reveal>
        <div className="max-w-4xl mx-auto text-center rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-surface to-secondary/10 p-14">
          <h2 className="text-h1 text-foreground mb-4">Bring your team into one workspace.</h2>
          <p className="text-muted max-w-md mx-auto mb-8">
            Start free — no credit card, no setup calls, just your team and an empty canvas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={onGetStarted}>
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="lg" onClick={onViewDemo}>
              <Play className="w-3.5 h-3.5" />
              View Demo
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}