import { z } from "zod";

/**
 * Zod schema for inviting a user to a group.
 */
export const InviteUserSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  email: z.string().email("Invalid email"),
});
export type InviteUserInput = z.infer<typeof InviteUserSchema>;

/**
 * Zod schema for joining a group with an invite link.
 */
export const JoinGroupWithLinkSchema = z.object({
  token: z.string().min(1, "Invite token is required"),
});
export type JoinGroupWithLinkInput = z.infer<typeof JoinGroupWithLinkSchema>;

/**
 * Zod schema for creating an invite.
 */
export const CreateInviteSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
});
export type CreateInviteInput = z.infer<typeof CreateInviteSchema>;