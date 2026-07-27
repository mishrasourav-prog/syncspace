import {
  BellRing,
  FileText,
  FolderKanban,
  KanbanSquare,
  MessageSquareText,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "./Reveal";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  colorClass: string;
}

const FEATURES: Feature[] = [
  {
    icon: FolderKanban,
    title: "Workspaces and projects",
    description:
      "Organize teams into workspaces and run focused projects with invitations, roles, archive states, members, and activity.",
    colorClass: "bg-primary/10 text-primary",
  },
  {
    icon: KanbanSquare,
    title: "Tasks and issues",
    description:
      "Track work through board and list views with statuses, priorities, assignees, due dates, filters, comments, and reordering.",
    colorClass: "bg-secondary/10 text-secondary",
  },
  {
    icon: FileText,
    title: "Project documents",
    description:
      "Create rich project documents with formatting, revisions, preview, duplication, exports, archive, and restore support.",
    colorClass: "bg-success/10 text-success",
  },
  {
    icon: MessageSquareText,
    title: "Project discussions",
    description:
      "Keep decisions connected to projects through threaded discussions, replies, participants, pinning, locking, and moderation.",
    colorClass: "bg-warning/10 text-warning",
  },
  {
    icon: BellRing,
    title: "Notifications and activity",
    description:
      "Follow meaningful workspace and project changes through unread notifications, activity feeds, and resource-aware navigation.",
    colorClass: "bg-primary/10 text-primary",
  },
  {
    icon: ShieldCheck,
    title: "Secure profiles and access",
    description:
      "Protect collaboration with role checks, HTTP-only authentication, OTP recovery, session revocation, and privacy-safe member profiles.",
    colorClass: "bg-secondary/10 text-secondary",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-border px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-10 max-w-2xl sm:mb-14">
          <span className="text-xs font-medium uppercase tracking-wide text-secondary">What is included</span>
          <h2 className="mt-3 text-h1 text-foreground">Every feature is connected to real project context.</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            Move from team setup to project delivery without splitting tasks, knowledge, decisions, and access across disconnected tools.
          </p>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {FEATURES.map(({ icon: Icon, title, description, colorClass }, index) => (
            <Reveal key={title} delay={index * 55}>
              <article className="h-full rounded-2xl border border-border bg-surface/50 p-5 transition-colors duration-300 hover:border-muted/40 hover:bg-surface sm:p-6">
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-medium text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
