import { z } from "zod";
import { WorkspaceRole } from "./workspace-member.model";

export const updateWorkspaceMemberRoleSchema = z.object({
    role: z.enum([
        WorkspaceRole.ADMIN,
        WorkspaceRole.MEMBER,
    ]),
});