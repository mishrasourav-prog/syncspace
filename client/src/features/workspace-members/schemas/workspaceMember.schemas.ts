import { z } from "zod";

export const inviteWorkspaceMemberSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  role: z.enum(["admin", "member", "guest"]),
});

export type InviteWorkspaceMemberFormValues = z.infer<typeof inviteWorkspaceMemberSchema>;
