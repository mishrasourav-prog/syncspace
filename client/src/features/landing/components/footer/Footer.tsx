import { Sparkles, Share2, MessageSquare, Bell } from "lucide-react";

const FOOTER_COLUMNS = [
  { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
  { title: "Company", links: ["About", "Careers", "Blog", "Contact"] },
  { title: "Resources", links: ["Docs", "Guides", "API", "Support"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security"] },
];

export function Footer() {
  return (
    <footer className="px-6 pt-20 pb-10 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-foreground font-semibold text-sm">SyncSpace</span>
            </div>
            <p className="text-sm text-muted max-w-xs leading-relaxed">
              The AI-powered workspace where teams brainstorm, plan, and ship together.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Share2, MessageSquare, Bell].map((Icon, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-muted/40 transition-colors duration-200 cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((c) => (
            <div key={c.title}>
              <h4 className="text-xs font-medium text-foreground/80 uppercase tracking-wide mb-4">{c.title}</h4>
              <div className="flex flex-col gap-2.5">
                {c.links.map((l) => (
                  <a key={l} href="#" className="text-sm text-muted hover:text-foreground transition-colors duration-200">
                    {l}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <span className="text-xs text-muted/70">© 2026 SyncSpace, Inc. All rights reserved.</span>
          <span className="text-xs text-muted/70">Built for teams who move fast.</span>
        </div>
      </div>
    </footer>
  );
}