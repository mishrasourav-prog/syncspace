import { z } from "zod";

import { objectIdSchema } from "../../validators/common.validation";

import { ProjectRole } from "../../interfaces/projectMember.interface";

export const createProjectInvitationSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Invalid email address."),

    role: z.enum([ProjectRole.ADMIN, ProjectRole.MEMBER]),
  })
  .strict();

export const projectInvitationIdSchema = z
  .object({
    invitationId: objectIdSchema,
  })
  .strict();
