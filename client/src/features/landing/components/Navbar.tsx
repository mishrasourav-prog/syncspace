import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

const NAV_LINKS = [
  { label: "Product", target: "product" },
  { label: "Workflow", target: "workflow" },
  { label: "Security", target: "security" },
  { label: "FAQ", target: "faq" },
] as const;

function scrollToSection(target: string): void {
  document
    .getElementById(target)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Navbar({ onGetStarted, onLogin }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  const navigateAndClose = (action?: () => void): void => {
    setDrawerOpen(false);
    action?.();
  };

  const handleAnchor = (target: string): void => {
    setDrawerOpen(false);
    window.setTimeout(() => scrollToSection(target), 0);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || drawerOpen
          ? "border-border bg-background/95"
          : "border-transparent bg-background/80"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button
          type="button"
          onClick={() => scrollToSection("top")}
          className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Go to the top of the SyncSpace landing page"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            S
          </span>
          <span className="text-base font-semibold tracking-tight text-foreground">
            SyncSpace
          </span>
        </button>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Landing page navigation"
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.target}
              type="button"
              onClick={() => scrollToSection(link.target)}
              className="rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" size="md" onClick={onLogin}>
            Log in
          </Button>
          <Button size="md" onClick={onGetStarted}>
            Get Started
          </Button>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 lg:hidden"
          onClick={() => setDrawerOpen((value) => !value)}
          aria-label={
            drawerOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-controls="landing-mobile-menu"
          aria-expanded={drawerOpen}
        >
          {drawerOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {drawerOpen ? (
          <motion.div
            id="landing-mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border bg-background/95 lg:hidden"
          >
            <div className="flex max-h-[calc(100vh-4rem)] flex-col gap-2 overflow-y-auto px-4 py-4 sm:px-6">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.target}
                  type="button"
                  onClick={() => handleAnchor(link.target)}
                  className="rounded-lg px-3 py-3 text-left text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {link.label}
                </button>
              ))}

              <div className="mt-2 grid gap-2 border-t border-border pt-4">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigateAndClose(onLogin)}
                >
                  Log in
                </Button>
                <Button
                  className="w-full"
                  onClick={() => navigateAndClose(onGetStarted)}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
