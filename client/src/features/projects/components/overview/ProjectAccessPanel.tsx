import type { ReactNode } from "react";
import { Pencil, ShieldCheck, UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WorkspaceSummary } from "@/features/workspaces/types/workspace.types";
import type {
  ProjectMember,
  ProjectRole,
} from "@/features/project-members/types/projectMember.types";
import {
  canEditProject,
  canInviteProjectMember,
} from "../../project.permissions";
import type { Project } from "../../types/project.types";

const roleBadgeVariant: Record<ProjectRole, "primary" | "neutral"> = {
  admin: "primary",
  member: "neutral",
};

interface ProjectAccessPanelProps {
  project: Project;
  workspace: WorkspaceSummary;
  role: ProjectRole | undefined;
  members: ProjectMember[];
  onInvite: () => void;
  onEdit: () => void;
}

function scrollToMembers() {
  document
    .getElementById("members")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ProjectAccessPanel({
  project,
  workspace,
  role,
  members,
  onInvite,
  onEdit,
}: ProjectAccessPanelProps) {
  const canInvite = canInviteProjectMember(project, workspace, role);
  const canEdit = canEditProject(project, workspace, role);
  const adminCount = members.filter((member) => member.role === "admin").length;

  return (
    <section
      id="settings"
      aria-labelledby="project-access-panel-heading"
      className="scroll-mt-24 rounded-xl border border-border bg-surface/60 p-5 shadow-soft"
    >
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <h2
          id="project-access-panel-heading"
          className="text-h3 text-foreground"
        >
          Project Access
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoRow label="Your role">
          {role ? (
            <Badge variant={roleBadgeVariant[role]}>{role}</Badge>
          ) : (
            <span className="text-sm text-muted">—</span>
          )}
        </InfoRow>

        <InfoRow label="Project status">
          <Badge variant={project.isArchived ? "warning" : "success"}>
            {project.isArchived ? "Read-only" : "Active"}
          </Badge>
        </InfoRow>

        <InfoRow label="You can invite">
          <Badge variant={canInvite ? "success" : "neutral"}>
            {canInvite ? "Yes" : "No"}
          </Badge>
        </InfoRow>

        <InfoRow label="Permitted invite roles">
          {canInvite ? (
            <div className="flex flex-wrap gap-1">
              <Badge variant="neutral">admin</Badge>
              <Badge variant="neutral">member</Badge>
            </div>
          ) : (
            <span className="text-sm text-muted">None</span>
          )}
        </InfoRow>

        <InfoRow label="Project admins">
          <span className="text-sm text-foreground">{adminCount}</span>
        </InfoRow>

        <InfoRow label="Total members">
          <span className="text-sm text-foreground">{members.length}</span>
        </InfoRow>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
        {canInvite && (
          <Button size="sm" onClick={onInvite}>
            <UserPlus className="h-3.5 w-3.5" />
            Invite members
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={scrollToMembers}>
          <Users className="h-3.5 w-3.5" />
          View members
        </Button>
        {canEdit && (
          <Button size="sm" variant="secondary" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
            Edit project details
          </Button>
        )}
      </div>
    </section>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-caption">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
