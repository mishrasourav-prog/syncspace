import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Reveal } from "../header & hero/Reveal";

const FAQ_ITEMS = [
  { q: "Can I migrate from Notion or Trello?", a: "Yes — SyncSpace imports boards, docs, and pages from most common tools in a few clicks." },
  { q: "Does SyncSpace work offline?", a: "Recent workspaces are cached locally, so you can keep working and everything syncs once you're back online." },
  { q: "Is my data private and secure?", a: "All data is encrypted in transit and at rest, with workspace-level permissions and audit logs on Team and Enterprise plans." },
  { q: "Can I self-host SyncSpace?", a: "Enterprise customers can deploy SyncSpace in a private cloud or on-prem environment." },
  { q: "What happens after the free plan limits?", a: "We'll let you know in-app before any limit is hit — you can upgrade anytime without losing work." },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-28 px-6 border-t border-border">
      <div className="max-w-3xl mx-auto">
        <Reveal className="mb-12 text-center">
          <span className="text-xs font-medium text-secondary tracking-wide uppercase">FAQ</span>
          <h2 className="mt-3 text-h1 text-foreground">Questions, answered.</h2>
        </Reveal>

        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={item.q} delay={i * 50}>
                <div className="rounded-xl border border-border bg-surface/50 overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-medium text-foreground">{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <p className="px-5 pb-4 text-sm text-muted leading-relaxed">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}