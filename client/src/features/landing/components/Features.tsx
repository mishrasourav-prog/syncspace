import {
  BellRing,
  FileText,
  FolderKanban,
  KanbanSquare,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "./Reveal";

interface FeatureRow {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURE_ROWS: FeatureRow[] = [
  {
    icon: FolderKanban,
    title: "Workspaces and projects",
    description:
      "Organize members, roles, invitations, projects, and recent activity.",
  },
  {
    icon: KanbanSquare,
    title: "Tasks and issues",
    description:
      "Track ownership, status, priority, due dates, comments, and realtime changes.",
  },
  {
    icon: FileText,
    title: "Documents",
    description:
      "Keep project knowledge and working notes beside the rest of the work.",
  },
  {
    icon: BellRing,
    title: "Discussions and notifications",
    description:
      "Make decisions visible and help members follow relevant project activity.",
  },
];

export function Features() {
  return (
    <section
      id="product"
      className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20 lg:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Reveal>
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <img
              src="/landing/workspace-overview.png"
              alt="SyncSpace workspace overview showing projects, members, access information, and activity"
              className="h-auto w-full"
              width={1800}
              height={1033}
              loading="lazy"
            />
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="text-h1 text-foreground">
            Everything your team needs to stay aligned.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
            Work stays easier to follow when tasks, knowledge, conversations,
            and access all live beside the project they belong to.
          </p>

          <div className="mt-8 flex flex-col divide-y divide-border border-t border-border">
            {FEATURE_ROWS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4 py-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
