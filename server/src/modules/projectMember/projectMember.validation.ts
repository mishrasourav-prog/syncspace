import { z } from "zod";

import { objectIdSchema } from "../../validators/common.validation";

import { ProjectRole } from "../../interfaces/projectMember.interface";

export const projectMemberProjectParamsSchema = z
  .object({
    projectId: objectIdSchema,
  })
  .strict();

export const projectMemberParamsSchema = z
  .object({
    projectId: objectIdSchema,
    memberId: objectIdSchema,
  })
  .strict();

export const updateProjectMemberRoleSchema = z
  .object({
    role: z.enum([ProjectRole.ADMIN, ProjectRole.MEMBER]),
  })
  .strict();
