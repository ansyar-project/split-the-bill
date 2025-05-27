"use server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import {
  InviteUserSchema,
  JoinGroupWithLinkSchema,
  CreateInviteSchema,
} from "../validation/inviteSchemas";

/**
 * Invites a user to a group by email.
 * @param groupId - Group ID
 * @param email - User email
 */
export async function inviteUserToGroup(groupId: string, email: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Validate input
  const parsed = InviteUserSchema.safeParse({ groupId, email });
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  // Check if already a member
  const existing = await prisma.membership.findUnique({
    where: {
      userId_groupId: {
        userId: user.id,
        groupId,
      },
    },
  });
  if (existing) throw new Error("User already in the group");

  await prisma.membership.create({
    data: {
      userId: user.id,
      groupId,
      role: "member",
    },
  });

  revalidatePath(`/dashboard/groups/${groupId}`);
}

/**
 * Joins a group using an invite token.
 * @param token - Invite token
 */
export async function joinGroupWithLink(token: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Validate input
  const parsed = JoinGroupWithLinkSchema.safeParse({ token });
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  const invite = await prisma.groupInvite.findUnique({ where: { token } });
  if (!invite || invite.expiresAt < new Date())
    throw new Error("Invalid or expired invite");

  const existing = await prisma.membership.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId: invite.groupId,
      },
    },
  });

  if (existing) throw new Error("You are already in this group.");

  await prisma.membership.create({
    data: {
      userId: session.user.id,
      groupId: invite.groupId,
      role: "member",
    },
  });

  await prisma.groupInvite.delete({ where: { token } });

  revalidatePath("/dashboard/groups");
}

/**
 * Creates an invite link for a group.
 * @param groupId - Group ID
 * @returns The invite token
 */
export async function createInvite(groupId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Validate input
  const parsed = CreateInviteSchema.safeParse({ groupId });
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite = await prisma.groupInvite.create({
    data: {
      token,
      groupId,
      createdBy: session.user.id,
      expiresAt,
    },
  });

  return invite.token;
}
