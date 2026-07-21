export type ProjectRole = "admin" | "member";

export interface ProjectMemberUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface ProjectMember {
  _id: string;
  project: string;
  user: ProjectMemberUser;
  role: ProjectRole;
  joinedAt: string;
}
