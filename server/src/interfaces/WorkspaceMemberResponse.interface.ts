import { WorkspaceRole } from "../modules/workspace-member/workspace-member.model";
import { IUser } from "./user.interface";

export interface WorkspaceMemberResponse {

    _id: string;

    user: IUser;

    role: WorkspaceRole;

    joinedAt: Date;

    createdAt: Date;

    updatedAt: Date;
}

export interface WorkspaceMembersResponse {

    members: WorkspaceMemberResponse[];
}