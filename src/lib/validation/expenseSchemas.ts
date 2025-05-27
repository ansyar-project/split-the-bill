import { z } from "zod";

/**
 * Zod schema for expense splits.
 */
export const ExpenseSplitSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  amount: z.number().min(0, "Amount must be non-negative"),
});

/**
 * Zod schema for creating an expense.
 */
export const CreateExpenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be positive"),
  splits: z.array(ExpenseSplitSchema).min(1, "At least one split is required"),
});
export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;

/**
 * Zod schema for editing an expense.
 */
export const EditExpenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().optional(),
  splits: z.array(ExpenseSplitSchema).optional(),
});
export type EditExpenseInput = z.infer<typeof EditExpenseSchema>;