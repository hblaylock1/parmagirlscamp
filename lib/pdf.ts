import { promises as fs } from "node:fs";
import path from "node:path";
import { PDFDocument, rgb } from "pdf-lib";
import type { NewRegistration } from "./types";
import { formatMountainDate } from "./format";
import { EVENT } from "./event";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "public",
  "parental_or_guardian_permission_medical_release.pdf",
);

export async function buildSignedPdf(data: NewRegistration): Promise<Uint8Array> {
  const signaturePng = dataUrlToBytes(data.signatureDataUrl);
  const templateBytes = await fs.readFile(TEMPLATE_PATH);
  const pdf = await PDFDocument.load(templateBytes);

  // The form is page 1; page 2 is instructions only — drop it.
  while (pdf.getPageCount() > 1) pdf.removePage(1);

  const form = pdf.getForm();
  const today = formatMountainDate();
  const page = pdf.getPages()[0];

  const setText = (name: string, value: string) => {
    try {
      form.getTextField(name).setText(value);
    } catch {
      // field missing in this template version — skip
    }
  };

  // Each Yes/No question is backed by a single PDFCheckBox with TWO widgets:
  // widget 0 is the "Yes" box, widget 1 is the "No" box. pdf-lib's .check()
  // only marks the first, so we draw an X on the correct widget and leave
  // the form checkbox itself unchecked.
  const markYesNo = (name: string, yes: boolean) => {
    try {
      const field = form.getCheckBox(name);
      field.uncheck();
      const widgets = field.acroField.getWidgets();
      const target = yes ? widgets[0] : widgets[1];
      if (!target) return;
      const r = target.getRectangle();
      const pad = 1.5;
      page.drawLine({
        start: { x: r.x + pad, y: r.y + pad },
        end: { x: r.x + r.width - pad, y: r.y + r.height - pad },
        thickness: 1.2,
        color: rgb(0, 0, 0),
      });
      page.drawLine({
        start: { x: r.x + r.width - pad, y: r.y + pad },
        end: { x: r.x + pad, y: r.y + r.height - pad },
        thickness: 1.2,
        color: rgb(0, 0, 0),
      });
    } catch {
      // field missing — skip
    }
  };

  setText("Event", EVENT.pdf.event);
  setText("Dates of event", EVENT.pdf.datesOfEvent);
  setText("Event description", EVENT.pdf.description);
  setText("Ward", data.ward);
  setText("Stake", EVENT.pdf.stake);
  setText("Event or activity leader", EVENT.pdf.leader);
  setText("Event or activity leaders phone number", EVENT.pdf.leaderPhone);
  setText("Event or activity leaders email", EVENT.pdf.leaderEmail);

  setText("Participant", `${data.youthFirstName} ${data.youthLastName}`);
  setText("Date of birth", data.youthBirthdate);
  setText("Age", calcAge(data.youthBirthdate));
  setText("Telephone number", data.parentPhone);
  setText("Address", data.address);
  setText("City", data.city);
  setText("State or Province", data.state);
  setText("Emergency contact parent or guardian", data.parentName);
  setText("Primary phone_1", data.parentPhone);

  markYesNo("Allergies", data.hasAllergies);
  setText("Allergy explanation", (data.allergies ?? "").trim());
  setText("List of Medications", data.medications ?? "");

  markYesNo("Special diet", data.specialDiet);
  setText("diet explanation", data.dietExplanation ?? "");
  markYesNo("Self Admin", data.selfAdminMeds);
  markYesNo("Surgery", data.recentSurgery);
  setText("If yes please explain_2", data.surgeryExplanation ?? "");
  markYesNo("Chronic illness", data.chronicIllness);
  setText("illness explanation", data.illnessExplanation ?? "");
  setText("Other limitations", data.otherLimitations ?? "");
  setText("Special needs", data.specialNeeds ?? "");

  setText("Date", today);
  setText("Date_2", today);

  const sigImage = await pdf.embedPng(signaturePng);
  stampSignature(
    pdf,
    form,
    "Parent or guardians signature if participant is a minor",
    sigImage,
  );

  form.flatten();
  return pdf.save();
}

function stampSignature(
  pdf: PDFDocument,
  form: ReturnType<PDFDocument["getForm"]>,
  fieldName: string,
  image: Awaited<ReturnType<PDFDocument["embedPng"]>>,
) {
  try {
    const field = form.getTextField(fieldName);
    const widget = field.acroField.getWidgets()[0];
    if (!widget) return;
    const rect = widget.getRectangle();
    const page = pdf.getPages()[0];

    // Draw the signature at a readable size, slightly below the field's
    // baseline so it sits on the signature line.
    const targetHeight = 28;
    const aspect = image.width / image.height;
    const maxWidth = Math.max(rect.width - 4, 1);
    let drawHeight = targetHeight;
    let drawWidth = drawHeight * aspect;
    if (drawWidth > maxWidth) {
      drawWidth = maxWidth;
      drawHeight = drawWidth / aspect;
    }
    const x = rect.x + (rect.width - drawWidth) / 2;
    const y = rect.y - 4;
    page.drawImage(image, { x, y, width: drawWidth, height: drawHeight });
  } catch {
    // field missing — skip stamping
  }
}

function calcAge(birthdate: string): string {
  const d = new Date(birthdate);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return String(age);
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const comma = dataUrl.indexOf(",");
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Uint8Array.from(Buffer.from(b64, "base64"));
}
