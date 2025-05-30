import { NextRequest, NextResponse } from "next/server";
import { generatePDFReport } from "@/lib/actions";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;
  const { searchParams } = new URL(req.url);
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  const pdfBuffer = await generatePDFReport(groupId, month, year);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="expense-report.pdf"`,
    },
  });
}
