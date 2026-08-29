import { NextResponse } from "next/server";
import { listRegistrations, readPdf } from "@/lib/storage";
import { EVENT } from "@/lib/event";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const rows = await listRegistrations();
  const row = rows.find((r) => r.id === id);
  if (!row) return new NextResponse("Not found", { status: 404 });

  const bytes = await readPdf(row.pdfFile);
  const filename = `${EVENT.shortName}-${row.youthLastName}-${row.youthFirstName}.pdf`
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  return new NextResponse(bytes as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
