export enum ProjectRole {
  ADMIN = "admin",
  MEMBER = "member",
}

export interface IAddProjectMember {
  userId: string;
  role?: ProjectRole;
}

export interface IUpdateProjectMemberRole {
  role: ProjectRole;
}

export interface IProjectMemberResponse {
  _id: string;

  project: string;

  user: {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar: string;
  };

  role: ProjectRole;

  joinedAt: Date;
}

export interface IProjectMembersResponse {
  members: IProjectMemberResponse[];
}
