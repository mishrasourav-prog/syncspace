import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

interface CTASectionProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

export function CTASection({ onGetStarted, onLogin }: CTASectionProps) {
  return (
    <section className="border-t border-border px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <Reveal className="mx-auto max-w-3xl text-center">
        <h2 className="text-h1 text-foreground">
          Give your team one place to keep the work connected.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          Create a workspace, invite your team, and keep project activity in
          context from the beginning.
        </p>
        <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Button size="lg" className="w-full sm:w-auto" onClick={onGetStarted}>
            Create account
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
    </section>
  );
}
