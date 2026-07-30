import { z } from "zod";

import { objectIdSchema } from "../../validators/common.validation";

import { WorkspaceRole } from "./workspace-member.model";

export const workspaceMemberWorkspaceParamsSchema = z
  .object({
    workspaceId: objectIdSchema,
  })
  .strict();

export const workspaceMemberParamsSchema = z
  .object({
    workspaceId: objectIdSchema,
    memberId: objectIdSchema,
  })
  .strict();

export const updateWorkspaceMemberRoleSchema = z
  .object({
    role: z.enum([
      WorkspaceRole.ADMIN,
      WorkspaceRole.MEMBER,
      WorkspaceRole.GUEST,
    ]),
  })
  .strict();
