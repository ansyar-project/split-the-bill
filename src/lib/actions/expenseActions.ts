"use server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  CreateExpenseSchema,
  EditExpenseSchema,
} from "../validation/expenseSchemas";

/**
 * Creates a new expense.
 * @param formData - FormData containing title, amount, splits
 * @param groupId - Group ID
 */
export async function createExpense(formData: FormData, groupId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const title = formData.get("title")?.toString();
  const amount = Number(formData.get("amount"));
  const splitsRaw = formData.get("splits");
  let splits: { userId: string; amount: number }[] = [];
  try {
    splits = splitsRaw ? JSON.parse(splitsRaw as string) : [];
  } catch {
    throw new Error("Invalid splits format");
  }

  // Validate input with Zod
  const parsed = CreateExpenseSchema.safeParse({ title, amount, splits });
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  await prisma.expense.create({
    data: {
      title: parsed.data.title,
      amount: parsed.data.amount,
      groupId,
      paidById: session.user.id,
      splits: {
        create: parsed.data.splits.map((split) => ({
          userId: split.userId,
          shareAmount: split.amount,
        })),
      },
    },
  });

  revalidatePath(`/dashboard/groups/${groupId}`);
}

/**
 * Edits an existing expense.
 * @param expenseId - Expense ID
 * @param formData - FormData containing title, amount, date, splits
 */
export async function editExpense(expenseId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const title = formData.get("title")?.toString();
  const amount = Number(formData.get("amount"));
  const date = formData.get("date")?.toString();
  const splitsRaw = formData.get("splits");
  let splits: { userId: string; amount: number }[] | undefined = undefined;
  if (splitsRaw) {
    try {
      splits = JSON.parse(splitsRaw as string);
    } catch {
      throw new Error("Invalid splits format");
    }
  }

  // Validate input with Zod
  const parsed = EditExpenseSchema.safeParse({ title, amount, date, splits });
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  // Fetch the expense to check permissions and groupId
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { splits: true },
  });
  if (!expense) throw new Error("Expense not found");

  // Optional: Only allow the user who created the expense or a group admin to edit

  // Update the expense
  await prisma.expense.update({
    where: { id: expenseId },
    data: {
      title: parsed.data.title,
      amount: parsed.data.amount,
      createdAt: parsed.data.date ? new Date(parsed.data.date) : undefined,
    },
  });

  // Update splits if provided
  if (parsed.data.splits) {
    // Delete old splits
    await prisma.expenseSplit.deleteMany({
      where: { expenseId },
    });
    // Create new splits
    await prisma.expenseSplit.createMany({
      data: parsed.data.splits.map((split) => ({
        expenseId,
        userId: split.userId,
        shareAmount: split.amount,
      })),
    });
  }

  revalidatePath(`/dashboard/groups/${expense.groupId}`);
}

/**
 * Deletes an expense.
 * @param expenseId - Expense ID
 */
export async function deleteExpense(expenseId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Fetch the expense to check permissions and groupId
  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense) throw new Error("Expense not found");

  // Optional: Only allow the user who created the expense or a group admin to delete

  await prisma.expense.delete({ where: { id: expenseId } });

  revalidatePath(`/dashboard/groups/${expense.groupId}`);
}
