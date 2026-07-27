import { ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

interface CTASectionProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

export function CTASection({ onGetStarted, onLogin }: CTASectionProps) {
  return (
    <section className="border-t border-border px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <Reveal>
        <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-surface to-secondary/10 p-6 text-center shadow-elevated sm:p-10 lg:p-14">
          <h2 className="text-h1 text-foreground">Bring your projects, tasks, and conversations together.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Create an account, start a workspace, and organize your team around one connected source of project context.
          </p>
          <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Button size="lg" className="w-full sm:w-auto" onClick={onGetStarted}>
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={onLogin}>
              <LogIn className="h-4 w-4" />
              Log In
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
