import type { ReactNode } from "react";
import { Pencil, ShieldCheck, UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  canEditWorkspace,
  canInviteWorkspaceMember,
  getInvitableWorkspaceRoles,
} from "../../workspace.permissions";
import type { WorkspaceSummary } from "../../types/workspace.types";

const roleBadgeVariant: Record<string, "primary" | "secondary" | "neutral"> = {
  owner: "primary",
  admin: "secondary",
  member: "neutral",
  guest: "neutral",
};

interface WorkspaceAccessPanelProps {
  workspace: WorkspaceSummary;
  onInvite: () => void;
  onEdit: () => void;
}

function scrollToMembers() {
  document.getElementById("members")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function WorkspaceAccessPanel({ workspace, onInvite, onEdit }: WorkspaceAccessPanelProps) {
  const canInvite = canInviteWorkspaceMember(workspace);
  const canEdit = canEditWorkspace(workspace);
  const invitableRoles = getInvitableWorkspaceRoles(workspace);

  return (
    <section
      id="settings"
      aria-labelledby="access-panel-heading"
      className="scroll-mt-24 rounded-xl border border-border bg-surface/60 p-5 shadow-soft"
    >
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <h2 id="access-panel-heading" className="text-h3 text-foreground">
          Workspace Access
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoRow label="Your role">
          <Badge variant={roleBadgeVariant[workspace.role]}>{workspace.role}</Badge>
        </InfoRow>

        <InfoRow label="Workspace status">
          <Badge variant={workspace.isArchived ? "warning" : "success"}>
            {workspace.isArchived ? "Read-only" : "Active"}
          </Badge>
        </InfoRow>

        <InfoRow label="You can invite">
          <Badge variant={canInvite ? "success" : "neutral"}>{canInvite ? "Yes" : "No"}</Badge>
        </InfoRow>

        <InfoRow label="Permitted invite roles">
          {invitableRoles.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {invitableRoles.map((role) => (
                <Badge key={role} variant="neutral">
                  {role}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted">None</span>
          )}
        </InfoRow>

        <InfoRow label="Default invite role">
          <span className="text-sm text-foreground">{workspace.settings.defaultRole}</span>
        </InfoRow>

        <InfoRow label="Guest invitations">
          <Badge variant={workspace.settings.allowGuestInvites ? "success" : "neutral"}>
            {workspace.settings.allowGuestInvites ? "Enabled" : "Disabled"}
          </Badge>
        </InfoRow>

        <InfoRow label="Member invitations">
          <Badge variant={workspace.settings.allowMemberInvites ? "success" : "neutral"}>
            {workspace.settings.allowMemberInvites ? "Enabled" : "Disabled"}
          </Badge>
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
            Edit workspace details
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
