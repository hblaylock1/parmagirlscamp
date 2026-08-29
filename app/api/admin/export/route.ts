import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listRegistrations } from "@/lib/storage";

export const runtime = "nodejs";

type Row = Awaited<ReturnType<typeof listRegistrations>>[number];

const COLUMNS: { key: keyof Row; label: string }[] = [
  { key: "createdAt", label: "Registered at" },
  { key: "ward", label: "Ward" },
  { key: "youthFirstName", label: "Youth first" },
  { key: "youthLastName", label: "Youth last" },
  { key: "youthBirthdate", label: "Birthdate" },
  { key: "youthGender", label: "Gender" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "allergies", label: "Allergies" },
  { key: "hasAllergies", label: "Has allergies?" },
  { key: "medications", label: "Medications" },
  { key: "specialDiet", label: "Special diet?" },
  { key: "dietExplanation", label: "Diet notes" },
  { key: "selfAdminMeds", label: "Self-admin meds?" },
  { key: "recentSurgery", label: "Recent surgery?" },
  { key: "surgeryExplanation", label: "Surgery notes" },
  { key: "chronicIllness", label: "Chronic illness?" },
  { key: "illnessExplanation", label: "Illness notes" },
  { key: "otherLimitations", label: "Other limitations" },
  { key: "specialNeeds", label: "Other accommodations / special needs" },
  { key: "parentName", label: "Parent" },
  { key: "parentEmail", label: "Parent email" },
  { key: "parentPhone", label: "Parent phone" },
  { key: "signatureName", label: "Signed by" },
  { key: "signedAt", label: "Signed at" },
];

function csvEscape(v: unknown): string {
  if (v === true) return "Yes";
  if (v === false) return "No";
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const requested = url.searchParams.get("ward");
  const ward = session.role === "ward" ? session.ward : requested;

  const rows = (await listRegistrations())
    .filter((r) => !ward || r.ward === ward)
    .sort((a, b) => a.ward.localeCompare(b.ward) || a.youthLastName.localeCompare(b.youthLastName));

  const header = COLUMNS.map((c) => csvEscape(c.label)).join(",");
  const body = rows
    .map((r) => COLUMNS.map((c) => csvEscape(r[c.key])).join(","))
    .join("\n");
  const csv = `${header}\n${body}\n`;

  const name = ward ? `nys-${ward}.csv` : "nys-all.csv";
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name.replace(/[^a-zA-Z0-9._-]/g, "_")}"`,
    },
  });
}
