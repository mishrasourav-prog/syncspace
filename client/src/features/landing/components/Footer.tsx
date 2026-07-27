import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FooterProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

const GITHUB_URL = "https://github.com/mishrasourav-prog/syncspace";

function scrollToSection(target: string): void {
  document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Footer({ onGetStarted, onLogin }: FooterProps) {
  return (
    <footer className="border-t border-border px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <span className="font-semibold tracking-tight text-foreground">SyncSpace</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              An open-source collaborative workspace for projects, tasks, documents, discussions, notifications, and secure team access.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center" aria-label="Footer navigation">
            <Button variant="ghost" size="sm" onClick={() => scrollToSection("features")}>Features</Button>
            <Button variant="ghost" size="sm" onClick={() => scrollToSection("security")}>Security</Button>
            <Button variant="ghost" size="sm" onClick={onLogin}>Log in</Button>
            <Button variant="secondary" size="sm" onClick={onGetStarted}>Get Started</Button>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.477 2 2 6.486 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.238-.009-.868-.014-1.703-2.782.605-3.369-1.344-3.369-1.344-.455-1.158-1.11-1.466-1.11-1.466-.908-.621.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.531 2.341 1.089 2.91.833.091-.648.349-1.089.635-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.688-.103-.253-.446-1.27.098-2.65 0 0 .84-.269 2.75 1.027A9.56 9.56 0 0 1 12 6.836a9.56 9.56 0 0 1 2.504.337c1.909-1.296 2.748-1.027 2.748-1.027.546 1.38.203 2.397.1 2.65.64.701 1.028 1.595 1.028 2.688 0 3.848-2.337 4.695-4.566 4.943.359.31.679.923.679 1.861 0 1.344-.012 2.428-.012 2.758 0 .268.18.58.688.482A10.024 10.024 0 0 0 22 12.021C22 6.486 17.523 2 12 2Z" />
              </svg>
              GitHub
            </a>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 SyncSpace</span>
          <span>Open-source collaborative workspace built by Sourav Mishra.</span>
        </div>
      </div>
    </footer>
  );
}
