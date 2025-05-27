"use server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  GroupMemberSchema,
  ChangeRoleSchema,
} from "../validation/membershipSchemas";

/**
 * Gets all members of a group.
 * @param groupId - Group ID
 */
export async function getGroupMembers(groupId: string) {
  // Validate input
  const parsed = z.string().min(1, "Group ID is required").safeParse(groupId);
  if (!parsed.success) throw new Error(parsed.error.errors[0].message);

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      memberships: {
        include: { user: true },
      },
    },
  });
  if (!group) return [];
  return group.memberships.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
  }));
}

/**
 * Removes a member from a group (admin only).
 * @param groupId - Group ID
 * @param userId - User ID to remove
 */
export async function removeGroupMember(groupId: string, userId: string) {
  // Validate input
  const parsed = GroupMemberSchema.safeParse({ groupId, userId });
  if (!parsed.success) throw new Error(parsed.error.errors[0].message);

  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Only allow admins to remove
  const admin = await prisma.membership.findFirst({
    where: { groupId, userId: session.user.id, role: "admin" },
  });
  if (!admin) throw new Error("Not allowed");

  await prisma.membership.delete({
    where: { userId_groupId: { userId, groupId } },
  });

  revalidatePath(`/dashboard/groups/${groupId}`);
}

/**
 * Changes a member's role (admin only).
 * @param groupId - Group ID
 * @param userId - User ID
 * @param newRole - New role ("admin" or "member")
 */
export async function changeGroupMemberRole(
  groupId: string,
  userId: string,
  newRole: "admin" | "member"
) {
  // Validate input
  const parsed = ChangeRoleSchema.safeParse({ groupId, userId, newRole });
  if (!parsed.success) throw new Error(parsed.error.errors[0].message);

  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Only allow admins to change roles
  const admin = await prisma.membership.findFirst({
    where: { groupId, userId: session.user.id, role: "admin" },
  });
  if (!admin) throw new Error("Not allowed");

  await prisma.membership.update({
    where: { userId_groupId: { userId, groupId } },
    data: { role: newRole },
  });

  revalidatePath(`/dashboard/groups/${groupId}`);
}
