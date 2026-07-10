import { z } from "zod";
import { InvitationRole } from "./workspaceInvitation.model";

export const inviteUserSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Invalid email address."),

    role: z.nativeEnum(InvitationRole).optional(),
});

export const invitationIdSchema = z.object({
    invitationId: z.string().trim(),
});