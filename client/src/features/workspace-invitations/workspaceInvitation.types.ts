export type InvitationRole = "admin" | "member" | "guest";
export type InvitationStatus = "pending" | "accepted" | "rejected" | "expired";

export interface WorkspaceInvitation {
  _id: string;
  workspace: string;
  workspaceName: string;
  email: string;
  invitedBy: string;
  role: InvitationRole;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}
