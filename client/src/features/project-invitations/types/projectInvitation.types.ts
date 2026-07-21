export type ProjectInvitationRole = "admin" | "member";

export interface ProjectInvitation {
  _id: string;
  project: string;
  email: string;
  invitedBy: string;
  role: ProjectInvitationRole;
  status: string;
  expiresAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
