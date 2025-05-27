import { z } from "zod";

/**
 * Zod schema for monthly report input.
 */
export const MonthlyReportSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  month: z.number().min(1).max(12),
  year: z.number().min(1970),
});
export type MonthlyReportInput = z.infer<typeof MonthlyReportSchema>;

/**
 * Zod schema for PDF report input.
 */
export const PDFReportSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(1970).optional(),
});
export type PDFReportInput = z.infer<typeof PDFReportSchema>;