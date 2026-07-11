import { z } from "zod";

import { ProjectRole } from "../projectMember/projectMember.model";

export const createProjectInvitationSchema = z.object({
    email: z
        .email("Invalid email address.")
        .trim()
        .toLowerCase(),

    role: z.enum(ProjectRole),
});

export const projectInvitationIdSchema = z.object({
    invitationId: z
        .string()
        .trim()
        .regex(
            /^[a-f\d]{24}$/i,
            "Invalid invitation id."
        ),
});