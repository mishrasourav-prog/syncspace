import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// const NAV_LINKS = ["Product", "Features", "Pricing", "Docs"];

interface NavbarProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

export function Navbar({ onGetStarted, onLogin }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-foreground font-semibold text-[15px] tracking-tight">SyncSpace</span>
        </div>

        {/* <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a key={link} href="#" className="text-sm text-muted hover:text-foreground transition-colors duration-200">
              {link}
            </a>
          ))}
        </nav> */}

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onLogin}
            className="text-sm text-muted hover:text-foreground transition-colors duration-200 px-3 py-2"
          >
            Log in
          </button>
          <Button size="md" onClick={onGetStarted}>
            Get Started
          </Button>
        </div>

        <button className="md:hidden text-muted" onClick={() => setDrawerOpen((v) => !v)} aria-label="Toggle menu">
          {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <div className="px-6 pb-6 flex flex-col gap-4">
              {/* {NAV_LINKS.map((link) => (
                <a key={link} href="#" className="text-sm text-muted py-1">
                  {link}
                </a>
              ))} */}
              <div className="flex flex-col gap-2 pt-2">
                <button onClick={onLogin} className="text-sm text-muted border border-border rounded-md py-2">
                  Log in
                </button>
                <Button onClick={onGetStarted}>Get Started</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}