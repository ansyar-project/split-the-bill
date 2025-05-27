import { z } from "zod";

/**
 * Zod schema for group/member actions.
 */
export const GroupMemberSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  userId: z.string().min(1, "User ID is required"),
});
export const ChangeRoleSchema = GroupMemberSchema.extend({
  newRole: z.enum(["admin", "member"]),
});