"use server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CreateGroupSchema } from "../validation/groupSchemas";

/**
 * Creates a new group.
 * @param formData - FormData containing name and description
 */
export async function createGroup(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const name = formData.get("name")?.toString();
  const description = formData.get("description")?.toString();

  // Validate input with Zod
  const parsed = CreateGroupSchema.safeParse({ name, description });
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  const group = await prisma.group.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      createdBy: session.user.id,
      memberships: {
        create: {
          userId: session.user.id,
          role: "admin",
        },
      },
    },
  });

  revalidatePath("/dashboard/groups");
  return group;
}

/**
 * Deletes a group by ID.
 * @param groupId - Group ID
 */
export async function deleteGroup(groupId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { memberships: true },
  });

  const isAdmin = group?.memberships.some(
    (m) => m.userId === session.user.id && m.role === "admin"
  );
  if (!isAdmin)
    throw new Error("You don't have permission to delete this group");

  // Delete related records first
  await prisma.expense.deleteMany({ where: { groupId } });
  await prisma.membership.deleteMany({ where: { groupId } });
  await prisma.groupInvite?.deleteMany?.({ where: { groupId } });

  await prisma.group.delete({ where: { id: groupId } });

  revalidatePath("/dashboard/groups");
}
