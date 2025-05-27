"use server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  MonthlyReportSchema,
  PDFReportSchema,
} from "../validation/reportSchemas";

/**
 * Gets the monthly report for a group.
 * @param groupId - Group ID
 * @param month - Month (1-12)
 * @param year - Year (e.g., 2025)
 */
export async function getMonthlyReport(
  groupId: string,
  month: number,
  year: number
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  // Validate input
  const parsed = MonthlyReportSchema.safeParse({ groupId, month, year });
  if (!parsed.success) throw new Error(parsed.error.errors[0].message);

  // Get all expenses for the group in the specified month/year
  const expenses = await prisma.expense.findMany({
    where: {
      groupId,
      createdAt: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      },
    },
    include: {
      splits: {
        include: { user: true },
      },
      paidBy: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Get all group members
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      memberships: { include: { user: true } },
    },
  });
  if (!group) return null;

  // Calculate balances
  const balances: Record<string, number> = {};
  group.memberships.forEach((m) => {
    balances[m.user.id] = 0;
  });

  expenses.forEach((expense) => {
    // The payer gets credited the full amount
    balances[expense.paidById] += expense.amount;
    // Each split deducts from the user
    expense.splits.forEach((split) => {
      balances[split.userId] -= split.shareAmount;
    });
  });

  return {
    expenses,
    members: group.memberships.map((m) => m.user),
    balances,
  };
}

/**
 * Generates a PDF report for a group (optionally for a specific month/year).
 * @param groupId - Group ID
 * @param month - Month (optional)
 * @param year - Year (optional)
 */
export async function generatePDFReport(
  groupId: string,
  month?: number,
  year?: number
) {
  // Validate input
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const parsed = PDFReportSchema.safeParse({ groupId, month, year });
  if (!parsed.success) throw new Error(parsed.error.errors[0].message);

  // Fetch group and all members
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      memberships: { include: { user: true } },
    },
  });
  if (!group) throw new Error("Group not found");

  // Fetch expenses for the month/year if provided, otherwise all
  let expenses = [];
  if (month && year) {
    expenses = await prisma.expense.findMany({
      where: {
        groupId,
        createdAt: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      include: { paidBy: true },
      orderBy: { createdAt: "asc" },
    });
  } else {
    expenses = await prisma.expense.findMany({
      where: { groupId },
      include: { paidBy: true },
      orderBy: { createdAt: "asc" },
    });
  }

  // Calculate balances
  const balances: Record<string, number> = {};
  group.memberships.forEach((m) => {
    balances[m.user.id] = 0;
  });

  for (const expense of expenses) {
    balances[expense.paidById] += expense.amount;
    const splits = await prisma.expenseSplit.findMany({
      where: { expenseId: expense.id },
    });
    splits.forEach((split) => {
      balances[split.userId] -= split.shareAmount;
    });
  }

  // PDFKit setup (same as before)
  const PDFDocument = (await import("pdfkit")).default;
  const { PassThrough } = await import("stream");
  const path = (await import("path")).default;
  const fontPath = path.resolve(
    process.cwd(),
    "public",
    "fonts",
    "Roboto-Regular.ttf"
  );
  const doc = new PDFDocument({ font: fontPath, margin: 40 });

  const buffers: Buffer[] = [];
  doc.on("data", buffers.push.bind(buffers));

  // Now you can safely write text
  doc.fillColor("#22223b").fontSize(24).text(`Expense Report`, {
    align: "center",
    underline: true,
  });
  doc.moveDown(0.5);
  doc.fontSize(16).fillColor("#4a4e69").text(group.name, { align: "center" });
  doc.moveDown(0.5);
  doc
    .fontSize(10)
    .fillColor("#9a8c98")
    .text(`Generated: ${new Date().toLocaleString("en-US")}`, {
      align: "center",
    });
  doc.moveDown(1);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke("#4a4e69");
  doc.moveDown(1.5);

  // Members Section
  doc.fontSize(14).fillColor("#22223b").text("Members", { underline: true });
  doc.moveDown(0.5);
  group.memberships.forEach((m) => {
    doc.fontSize(12).fillColor("#22223b").text(`• ${m.user.name} (${m.role})`);
  });
  doc.moveDown(1);

  // Balances Section
  doc.fontSize(14).fillColor("#22223b").text("Balances", { underline: true });
  doc.moveDown(0.5);
  group.memberships.forEach((m) => {
    const balance = balances[m.user.id] || 0;
    doc
      .fontSize(12)
      .fillColor("#22223b")
      .text(`• ${m.user.name}: `, { continued: true })
      .fillColor(balance >= 0 ? "#16a34a" : "#dc2626")
      .text(
        balance.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        }),
        { continued: false }
      );
  });
  doc.moveDown(1);

  // Expenses Section (table)
  doc.fontSize(14).fillColor("#22223b").text("Expenses", { underline: true });
  doc.moveDown(0.5);

  if (expenses.length === 0) {
    doc.fontSize(12).fillColor("#9a8c98").text("No expenses recorded.");
  } else {
    // Table column positions
    const startX = 40;
    const colDate = startX;
    const colTitle = colDate + 80;
    const colAmount = colTitle + 180;
    const colPaidBy = colAmount + 100;
    let y = doc.y;

    // Table Header
    doc
      .fontSize(12)
      .fillColor("#4a4e69")
      .text("Date", colDate, y)
      .text("Title", colTitle, y)
      .text("Amount", colAmount, y, { width: 90, align: "right" })
      .text("Paid By", colPaidBy, y);
    y += 18;
    doc
      .moveTo(startX, y - 2)
      .lineTo(555, y - 2)
      .stroke("#9a8c98");

    // Table Rows
    expenses.forEach((e) => {
      doc
        .fontSize(12)
        .fillColor("#22223b")
        .text(new Date(e.createdAt).toLocaleDateString("en-GB"), colDate, y)
        .text(e.title, colTitle, y)
        .text(
          e.amount.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          }),
          colAmount,
          y,
          { width: 90, align: "right" }
        )
        .text(e.paidBy?.name || "-", colPaidBy, y);
      y += 18;
    });
  }

  doc.moveDown(1);
  doc
    .fontSize(10)
    .fillColor("#9a8c98")
    .text("Generated by Expense Sharing App", { align: "center" });

  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
    const stream = new PassThrough();
    const buffers: Buffer[] = [];
    stream.on("data", (data) => buffers.push(data));
    stream.on("end", () => resolve(Buffer.concat(buffers)));
    stream.on("error", reject);
    doc.pipe(stream);
    doc.end();
  });

  return pdfBuffer;
}
