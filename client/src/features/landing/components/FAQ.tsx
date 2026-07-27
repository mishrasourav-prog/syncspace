import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Reveal } from "./Reveal";

const FAQ_ITEMS = [
  {
    question: "What can I manage in SyncSpace?",
    answer:
      "SyncSpace combines workspaces, projects, tasks, issues, documents, discussions, memberships, invitations, notifications, activity, and user profiles.",
  },
  {
    question: "How do workspace and project roles work?",
    answer:
      "Workspaces support owner, admin, member, and guest roles. Projects use admin and member roles. Protected operations are checked against the relevant membership and role.",
  },
  {
    question: "Does SyncSpace update in real time?",
    answer:
      "Socket.IO delivers scoped updates for tasks, documents, discussions, notifications, activity, access changes, and session revocation. REST remains the authoritative source of persisted data.",
  },
  {
    question: "How is authentication secured?",
    answer:
      "SyncSpace uses HTTP-only access and refresh token cookies, password hashing, automatic token refresh, OTP-based recovery, and database-backed session-version checks.",
  },
  {
    question: "Can I run SyncSpace locally?",
    answer:
      "Yes. The repository can run locally with Node.js, MongoDB, SMTP credentials for password recovery, and Cloudinary credentials for avatar storage.",
  },
  {
    question: "Does SyncSpace currently support offline work?",
    answer: "No. SyncSpace currently requires an active connection to fetch and synchronize workspace data.",
  },
] as const;

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section id="faq" className="scroll-mt-20 border-t border-border px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-3xl">
        <Reveal className="mb-10 text-center sm:mb-12">
          <span className="text-xs font-medium uppercase tracking-wide text-secondary">FAQ</span>
          <h2 className="mt-3 text-h1 text-foreground">Questions, answered honestly.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted">
            The answers below describe the capabilities that are available in the current application.
          </p>
        </Reveal>

        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            return (
              <Reveal key={item.question} delay={index * 40}>
                <article className="overflow-hidden rounded-xl border border-border bg-surface/50">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50 sm:px-5"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    <span className="text-sm font-medium text-foreground">{item.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        id={panelId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <p className="px-4 pb-4 text-sm leading-relaxed text-muted sm:px-5 sm:pb-5">{item.answer}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
