"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Registration } from "@/lib/types";
import {
  Field,
  FullRow,
  Grid,
  QARow,
  Section,
  Select,
  TableSection,
  YesNoNoteRow,
} from "@/app/_components/FormFields";
import {
  BIRTHDATE_ERROR,
  BIRTHDATE_HELP,
  MAX_BIRTHDATE,
  isBirthdateAllowed,
} from "@/lib/eligibility";

interface Props {
  registration: Registration;
  wards: string[];
  canChangeWard: boolean;
}

export default function EditRegistrationForm({
  registration,
  wards,
  canChangeWard,
}: Props) {
  const router = useRouter();
  const r = registration;
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    const ok = window.confirm(
      `Delete the registration for ${r.youthFirstName} ${r.youthLastName}? This cannot be undone and will remove the signed PDF.`,
    );
    if (!ok) return;
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/edit/${r.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.text()) || "Delete failed");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const birthdate = String(fd.get("youthBirthdate") ?? "");
    if (!isBirthdateAllowed(birthdate)) {
      setError(BIRTHDATE_ERROR);
      return;
    }
    const raw = Object.fromEntries(fd.entries()) as Record<string, string>;
    const bool = (name: string) => fd.get(name) === "yes";
    const body = {
      ...raw,
      specialDiet: bool("specialDiet"),
      hasAllergies: bool("hasAllergies"),
      selfAdminMeds: bool("selfAdminMeds"),
      recentSurgery: bool("recentSurgery"),
      chronicIllness: bool("chronicIllness"),
    };

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/edit/${r.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.text()) || "Save failed");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Section title="Youth information">
        <Grid>
          <Field label="First name" name="youthFirstName" required defaultValue={r.youthFirstName} />
          <Field label="Last name" name="youthLastName" required defaultValue={r.youthLastName} />
          <Field
            label="Birthdate"
            name="youthBirthdate"
            type="date"
            required
            defaultValue={r.youthBirthdate}
            max={MAX_BIRTHDATE ?? undefined}
            helpText={BIRTHDATE_HELP}
          />
          <Select label="Gender" name="youthGender" required options={["Male", "Female"]} defaultValue={r.youthGender} />
          {canChangeWard ? (
            <Select label="Ward / branch" name="ward" required options={wards} defaultValue={r.ward} />
          ) : (
            <div>
              <label className="label">Ward / branch</label>
              <input className="field bg-slate-100 text-slate-600" value={r.ward} readOnly />
              <input type="hidden" name="ward" value={r.ward} />
            </div>
          )}
        </Grid>
      </Section>

      <Section title="Address">
        <Field label="Street address" name="address" required defaultValue={r.address} />
        <Grid>
          <Field label="City" name="city" required defaultValue={r.city} />
          <Field label="State" name="state" required defaultValue={r.state} />
        </Grid>
      </Section>

      <TableSection title="Medical Information">
        <QARow
          question="Does the participant require a special diet?"
          name="specialDiet"
          explanationName="dietExplanation"
          explanationLabel="If yes, please explain the dietary restrictions."
          initialYesNo={r.specialDiet}
          initialExplanation={r.dietExplanation}
        />
        <QARow
          question="Does the participant have any allergies?"
          name="hasAllergies"
          explanationName="allergies"
          explanationLabel="If yes, please list the allergies."
          initialYesNo={r.hasAllergies}
          initialExplanation={r.allergies}
        />
        <FullRow
          label="List all prescription or over-the-counter (OTC) medications the participant is taking. Leave blank if none."
          name="medications"
          defaultValue={r.medications}
        />
        <YesNoNoteRow
          question="Can the participant self-administer his or her medication?"
          name="selfAdminMeds"
          note="If no, please contact the event or activity leader directly."
          initialYesNo={r.selfAdminMeds}
        />
      </TableSection>

      <TableSection title="Conditions That Limit Activity">
        <QARow
          question="Does the participant have a chronic or recurring illness?"
          name="chronicIllness"
          explanationName="illnessExplanation"
          explanationLabel="If yes, please explain."
          initialYesNo={r.chronicIllness}
          initialExplanation={r.illnessExplanation}
        />
        <QARow
          question="Has the participant had surgery or a serious illness in the past year?"
          name="recentSurgery"
          explanationName="surgeryExplanation"
          explanationLabel="If yes, please explain."
          initialYesNo={r.recentSurgery}
          initialExplanation={r.surgeryExplanation}
        />
        <FullRow
          label="Identify any other limits, restrictions, or disabilities that could prevent the participant from fully participating in the event or activity."
          name="otherLimitations"
          defaultValue={r.otherLimitations}
        />
      </TableSection>

      <TableSection title="Other Accommodations or Special Needs">
        <FullRow
          label="Identify any other needs or considerations the participant has that the event or activity planner should be aware of."
          name="specialNeeds"
          defaultValue={r.specialNeeds}
        />
      </TableSection>

      <Section title="Parent / guardian (also emergency contact)">
        <Grid>
          <Field label="Full name" name="parentName" required defaultValue={r.parentName} />
          <Field label="Email" name="parentEmail" type="email" required defaultValue={r.parentEmail} />
          <Field label="Phone" name="parentPhone" type="tel" required defaultValue={r.parentPhone} />
        </Grid>
      </Section>

      {error ? (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting || submitting}
          className="btn inline-flex items-center justify-center rounded-md border border-red-300 bg-white px-4 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete registration"}
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="btn-secondary"
            disabled={submitting || deleting}
          >
            Cancel
          </button>
          <button type="submit" disabled={submitting || deleting} className="btn-primary">
            {submitting ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
