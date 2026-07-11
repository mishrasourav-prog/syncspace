import { z } from "zod";
import { ProjectRole } from "./projectMember.model";

export const updateProjectMemberRoleSchema = z.object({
    role: z.enum([
        ProjectRole.ADMIN,
        ProjectRole.MEMBER,
    ]),
});

export const projectMemberIdSchema = z.object({
    projectId: z.string().regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid project id."
    ),
    memberId: z.string().regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid member id."
    ),
});