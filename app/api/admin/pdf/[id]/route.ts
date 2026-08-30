import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listRegistrations, readPdf } from "@/lib/storage";
import { EVENT } from "@/lib/event";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const rows = await listRegistrations();
  const row = rows.find((r) => r.id === id);
  if (!row) return new NextResponse("Not found", { status: 404 });

  if (session.role === "ward" && row.ward !== session.ward) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const bytes = await readPdf(row.pdfFile);
  const filename = `${EVENT.shortName}-${row.ward}-${row.youthLastName}-${row.youthFirstName}.pdf`
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  return new NextResponse(bytes as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
