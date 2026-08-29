import { NextResponse } from "next/server";
import { createRegistration } from "@/lib/storage";
import { buildSignedPdf } from "@/lib/pdf";
import type { NewRegistration } from "@/lib/types";
import { WARDS } from "@/lib/wards";
import { BIRTHDATE_ERROR, isBirthdateAllowed } from "@/lib/eligibility";

export const runtime = "nodejs";

const REQUIRED_STRING: (keyof NewRegistration)[] = [
  "youthFirstName",
  "youthLastName",
  "youthBirthdate",
  "youthGender",
  "ward",
  "address",
  "city",
  "state",
  "parentName",
  "parentEmail",
  "parentPhone",
  "signatureName",
  "signatureDataUrl",
];

export async function POST(req: Request) {
  let body: Partial<NewRegistration>;
  try {
    body = (await req.json()) as Partial<NewRegistration>;
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  for (const key of REQUIRED_STRING) {
    const v = body[key];
    if (typeof v !== "string" || v.trim() === "") {
      return new NextResponse(`Missing required field: ${key}`, { status: 400 });
    }
  }

  if (!WARDS.includes(body.ward as (typeof WARDS)[number])) {
    return new NextResponse("Invalid ward", { status: 400 });
  }
  if (!isBirthdateAllowed(body.youthBirthdate as string)) {
    return new NextResponse(BIRTHDATE_ERROR, { status: 400 });
  }
  if (!body.signatureDataUrl!.startsWith("data:image/png")) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const bool = (v: unknown) => v === true;

  const data: NewRegistration = {
    youthFirstName: body.youthFirstName!,
    youthLastName: body.youthLastName!,
    youthBirthdate: body.youthBirthdate!,
    youthGender: body.youthGender!,
    ward: body.ward!,
    address: body.address!,
    city: body.city!,
    state: body.state!,
    hasAllergies: bool(body.hasAllergies),
    allergies: str(body.allergies),
    medications: str(body.medications),
    specialDiet: bool(body.specialDiet),
    dietExplanation: str(body.dietExplanation),
    selfAdminMeds: bool(body.selfAdminMeds),
    recentSurgery: bool(body.recentSurgery),
    surgeryExplanation: str(body.surgeryExplanation),
    chronicIllness: bool(body.chronicIllness),
    illnessExplanation: str(body.illnessExplanation),
    otherLimitations: str(body.otherLimitations),
    specialNeeds: str(body.specialNeeds),
    parentName: body.parentName!,
    parentEmail: body.parentEmail!,
    parentPhone: body.parentPhone!,
    signatureName: body.signatureName!,
    signatureDataUrl: body.signatureDataUrl!,
  };

  const pdfBytes = await buildSignedPdf(data);
  const { signatureDataUrl, ...rest } = data;
  void signatureDataUrl;
  const row = await createRegistration(rest, pdfBytes);

  return NextResponse.json({ id: row.id });
}
