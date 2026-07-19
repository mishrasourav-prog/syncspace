// import type { LucideIcon } from "lucide-react";
// import { FolderKanban, FolderOpen, ShieldCheck, Users } from "lucide-react";
// import { Skeleton } from "@/components/ui/skeleton";
// import type { Project } from "@/features/projects/types/project.types";
// import type { WorkspaceMember } from "@/features/workspace-members/types/workspaceMember.types";

// interface MetricCardProps {
//   icon: LucideIcon;
//   iconClassName: string;
//   value: number;
//   label: string;
//   helper: string;
// }

// function MetricCard({ icon: Icon, iconClassName, value, label, helper }: MetricCardProps) {
//   return (
//     <div className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft">
//       <div className="flex items-center gap-3">
//         <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}>
//           <Icon className="h-4.5 w-4.5" />
//         </span>
//         <div className="min-w-0">
//           <p className="text-xl font-semibold text-foreground">{value}</p>
//           <p className="truncate text-caption">{label}</p>
//         </div>
//       </div>
//       <p className="mt-2 truncate text-[11px] text-muted/70">{helper}</p>
//     </div>
//   );
// }

// function MetricCardSkeleton() {
//   return (
//     <div className="rounded-xl border border-border bg-surface/60 p-4">
//       <div className="flex items-center gap-3">
//         <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
//         <div className="min-w-0 flex-1 space-y-1.5">
//           <Skeleton className="h-5 w-10" />
//           <Skeleton className="h-3 w-20" />
//         </div>
//       </div>
//       <Skeleton className="mt-2 h-3 w-16" />
//     </div>
//   );
// }

// interface WorkspaceOverviewMetricsProps {
//   projects: Project[];
//   members: WorkspaceMember[];
//   isLoadingProjects: boolean;
//   isLoadingMembers: boolean;
// }

// export function WorkspaceOverviewMetrics({
//   projects,
//   members,
//   isLoadingProjects,
//   isLoadingMembers,
// }: WorkspaceOverviewMetricsProps) {
//   const totalProjects = projects.length;
//   const archivedProjects = projects.filter((project) => project.isArchived).length;
//   const activeProjects = totalProjects - archivedProjects;

//   const memberCount = members.length;
//   const guestCount = members.filter((member) => member.role === "guest").length;
//   const adminAccessCount = members.filter((member) => member.role === "owner" || member.role === "admin").length;

//   return (
//     <div id="overview" className="scroll-mt-24 grid grid-cols-2 gap-3 xl:grid-cols-4">
//       {isLoadingProjects ? (
//         <>
//           <MetricCardSkeleton />
//           <MetricCardSkeleton />
//         </>
//       ) : (
//         <>
//           <MetricCard
//             icon={FolderKanban}
//             iconClassName="bg-primary/15 text-primary"
//             value={totalProjects}
//             label="Total Projects"
//             helper={archivedProjects > 0 ? `${archivedProjects} archived` : "None archived"}
//           />
//           <MetricCard
//             icon={FolderOpen}
//             iconClassName="bg-secondary/15 text-secondary"
//             value={activeProjects}
//             label="Active Projects"
//             helper={`${totalProjects} total`}
//           />
//         </>
//       )}

//       {isLoadingMembers ? (
//         <>
//           <MetricCardSkeleton />
//           <MetricCardSkeleton />
//         </>
//       ) : (
//         <>
//           <MetricCard
//             icon={Users}
//             iconClassName="bg-success/15 text-success"
//             value={memberCount}
//             label="Members"
//             helper={guestCount > 0 ? `${guestCount} guests` : "No guests"}
//           />
//           <MetricCard
//             icon={ShieldCheck}
//             iconClassName="bg-warning/15 text-warning"
//             value={adminAccessCount}
//             label="Admins & Owner"
//             helper="Workspace managers"
//           />
//         </>
//       )}
//     </div>
//   );
// }

import type {
    LucideIcon,
} from "lucide-react";

import {
    FolderKanban,
    FolderOpen,
    ShieldCheck,
    Users,
} from "lucide-react";

import {
    Skeleton,
} from "@/components/ui/skeleton";

import type {
    Project,
} from "@/features/projects/types/project.types";

import type {
    WorkspaceMember,
} from "@/features/workspace-members/types/workspaceMember.types";

interface MetricCardProps {
    icon:
        LucideIcon;

    iconClassName:
        string;

    value:
        number |
        string;

    label:
        string;

    helper:
        string;
}

function MetricCard({
    icon:
        Icon,

    iconClassName,

    value,

    label,

    helper,
}: MetricCardProps) {
    return (
        <div
            className="
                rounded-xl
                border
                border-border
                bg-surface/60
                p-4
                shadow-soft
            "
        >
            <div
                className="
                    flex
                    items-center
                    gap-3
                "
            >
                <span
                    className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        ${iconClassName}
                    `}
                >
                    <Icon
                        className="
                            h-4.5
                            w-4.5
                        "
                    />
                </span>

                <div className="min-w-0">
                    <p
                        className="
                            text-xl
                            font-semibold
                            text-foreground
                        "
                    >
                        {value}
                    </p>

                    <p
                        className="
                            truncate
                            text-caption
                        "
                    >
                        {label}
                    </p>
                </div>
            </div>

            <p
                className="
                    mt-2
                    truncate
                    text-[11px]
                    text-muted/70
                "
            >
                {helper}
            </p>
        </div>
    );
}

function MetricCardSkeleton() {
    return (
        <div
            className="
                rounded-xl
                border
                border-border
                bg-surface/60
                p-4
            "
        >
            <div
                className="
                    flex
                    items-center
                    gap-3
                "
            >
                <Skeleton
                    className="
                        h-10
                        w-10
                        shrink-0
                        rounded-lg
                    "
                />

                <div
                    className="
                        min-w-0
                        flex-1
                        space-y-1.5
                    "
                >
                    <Skeleton className="h-5 w-10" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>

            <Skeleton className="mt-2 h-3 w-16" />
        </div>
    );
}

interface WorkspaceOverviewMetricsProps {
    projects:
        Project[];

    members:
        WorkspaceMember[];

    isLoadingProjects:
        boolean;

    isLoadingMembers:
        boolean;

    hasProjectsError:
        boolean;

    hasMembersError:
        boolean;
}

export function WorkspaceOverviewMetrics({
    projects,

    members,

    isLoadingProjects,

    isLoadingMembers,

    hasProjectsError,

    hasMembersError,
}: WorkspaceOverviewMetricsProps) {
    const totalProjects =
        projects.length;

    const archivedProjects =
        projects.filter(
            (
                project
            ) =>
                project.isArchived
        ).length;

    const activeProjects =
        totalProjects -
        archivedProjects;

    const memberCount =
        members.length;

    const guestCount =
        members.filter(
            (
                member
            ) =>
                member.role ===
                "guest"
        ).length;

    const adminAccessCount =
        members.filter(
            (
                member
            ) =>
                member.role ===
                    "owner" ||
                member.role ===
                    "admin"
        ).length;

    return (
        <div
            id="overview"
            className="
                scroll-mt-24
                grid
                grid-cols-2
                gap-3
                xl:grid-cols-4
            "
        >
            {
                isLoadingProjects ? (
                    <>
                        <MetricCardSkeleton />
                        <MetricCardSkeleton />
                    </>
                ) : hasProjectsError ? (
                    <>
                        <MetricCard
                            icon={
                                FolderKanban
                            }
                            iconClassName="
                                bg-primary/15
                                text-primary
                            "
                            value="—"
                            label="Total Projects"
                            helper="Unavailable"
                        />

                        <MetricCard
                            icon={
                                FolderOpen
                            }
                            iconClassName="
                                bg-secondary/15
                                text-secondary
                            "
                            value="—"
                            label="Active Projects"
                            helper="Unavailable"
                        />
                    </>
                ) : (
                    <>
                        <MetricCard
                            icon={
                                FolderKanban
                            }
                            iconClassName="
                                bg-primary/15
                                text-primary
                            "
                            value={
                                totalProjects
                            }
                            label="Total Projects"
                            helper={
                                archivedProjects >
                                0
                                    ? `${archivedProjects} archived`
                                    : "None archived"
                            }
                        />

                        <MetricCard
                            icon={
                                FolderOpen
                            }
                            iconClassName="
                                bg-secondary/15
                                text-secondary
                            "
                            value={
                                activeProjects
                            }
                            label="Active Projects"
                            helper={`${totalProjects} total`}
                        />
                    </>
                )
            }

            {
                isLoadingMembers ? (
                    <>
                        <MetricCardSkeleton />
                        <MetricCardSkeleton />
                    </>
                ) : hasMembersError ? (
                    <>
                        <MetricCard
                            icon={
                                Users
                            }
                            iconClassName="
                                bg-success/15
                                text-success
                            "
                            value="—"
                            label="Members"
                            helper="Unavailable"
                        />

                        <MetricCard
                            icon={
                                ShieldCheck
                            }
                            iconClassName="
                                bg-warning/15
                                text-warning
                            "
                            value="—"
                            label="Admins & Owner"
                            helper="Unavailable"
                        />
                    </>
                ) : (
                    <>
                        <MetricCard
                            icon={
                                Users
                            }
                            iconClassName="
                                bg-success/15
                                text-success
                            "
                            value={
                                memberCount
                            }
                            label="Members"
                            helper={
                                guestCount >
                                0
                                    ? `${guestCount} guests`
                                    : "No guests"
                            }
                        />

                        <MetricCard
                            icon={
                                ShieldCheck
                            }
                            iconClassName="
                                bg-warning/15
                                text-warning
                            "
                            value={
                                adminAccessCount
                            }
                            label="Admins & Owner"
                            helper="Workspace managers"
                        />
                    </>
                )
            }
        </div>
    );
}