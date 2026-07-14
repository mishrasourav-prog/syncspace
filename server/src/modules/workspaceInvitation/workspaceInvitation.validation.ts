import { z } from "zod";

import {
    objectIdSchema,
} from "../../validators/common.validation";

import {
    InvitationRole,
} from "./workspaceInvitation.model";

/*
|--------------------------------------------------------------------------
| Route Parameters
|--------------------------------------------------------------------------
*/

export const workspaceInvitationWorkspaceParamsSchema =
    z.object({
        workspaceId: objectIdSchema,
    }).strict();

export const workspaceInvitationParamsSchema =
    z.object({
        invitationId: objectIdSchema,
    }).strict();

/*
|--------------------------------------------------------------------------
| Invite User Body
|--------------------------------------------------------------------------
*/

export const inviteUserSchema =
    z.object({
        email: z
            .string()
            .trim()
            .email(
                "Invalid email address."
            ),

        role: z
            .enum(InvitationRole)
            .optional(),
    })
    .strict();