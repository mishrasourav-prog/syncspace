import { z } from "zod";

export const inviteProjectMemberSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  role: z.enum(["admin", "member"]),
});

export type InviteProjectMemberFormValues = z.infer<
  typeof inviteProjectMemberSchema
>;
