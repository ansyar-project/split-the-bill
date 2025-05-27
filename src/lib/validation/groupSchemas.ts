import { z } from "zod";

/**
 * Zod schema for group creation.
 */
export const CreateGroupSchema = z.object({
  name: z.string().min(2, "Group name is required"),
  description: z.string().optional(),
});
export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;