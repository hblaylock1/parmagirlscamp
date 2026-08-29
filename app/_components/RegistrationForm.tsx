"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import type SignatureCanvas from "react-signature-canvas";
import {
  Field,
  FullRow,
  Grid,
  QARow,
  Section,
  Select,
  TableSection,
  YesNoNoteRow,
} from "./FormFields";
import {
  BIRTHDATE_ERROR,
  BIRTHDATE_HELP,
  MAX_BIRTHDATE,
  isBirthdateAllowed,
} from "@/lib/eligibility";
import { EVENT, SINGLE_WARD } from "@/lib/event";

const SignaturePad = dynamic(() => import("./ClientSignaturePad"), {
  ssr: false,
});

export default function RegistrationForm() {
  const sigRef = useRef<SignatureCanvas | null>(null);
  const firstInvalidRef = useRef<HTMLElement | null>(null);
  const invalidTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string } | null>(null);

  const wards = [...EVENT.wards];
  const fee = EVENT.fee;

  // iOS Safari blocks submission on the first invalid field but doesn't
  // scroll it into view, so the user just sees the button flash with no
  // explanation. Catch the invalid events ourselves, surface a banner, and
  // jump to the first offending field.
  function handleInvalidCapture(e: React.FormEvent<HTMLFormElement>) {
    const target = e.target as HTMLElement;
    if (!firstInvalidRef.current) firstInvalidRef.current = target;
    if (invalidTimerRef.current) clearTimeout(invalidTimerRef.current);
    invalidTimerRef.current = setTimeout(() => {
      const el = firstInvalidRef.current;
      firstInvalidRef.current = null;
      invalidTimerRef.current = null;
      if (!el) return;
      setError("Please fill out all required fields, then submit again.");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const pad = sigRef.current;
    if (!pad || pad.isEmpty()) {
      setError("Please sign the permission slip before submitting.");
      return;
    }
    const signatureDataUrl = pad.getCanvas().toDataURL("image/png");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const birthdate = String(fd.get("youthBirthdate") ?? "");
    if (!isBirthdateAllowed(birthdate)) {
      setError(BIRTHDATE_ERROR);
      return;
    }
    const raw = Object.fromEntries(fd.entries()) as Record<string, string>;

    const bool = (name: string) => fd.get(name) === "yes";
    const body = {
      ...raw,
      ward: SINGLE_WARD ?? raw.ward,
      specialDiet: bool("specialDiet"),
      hasAllergies: bool("hasAllergies"),
      selfAdminMeds: bool("selfAdminMeds"),
      recentSurgery: bool("recentSurgery"),
      chronicIllness: bool("chronicIllness"),
      signatureDataUrl,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Something went wrong");
      }
      const json = (await res.json()) as { id: string };
      setDone(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <h2 className="text-lg font-semibold text-green-800">
          You&apos;re registered!
        </h2>
        <p className="mt-2 text-green-700">
          Thanks — we&apos;ve recorded the permission slip. You can download a
          signed copy below for your records.
        </p>
        {fee ? (
          <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
            <span className="font-semibold">
              Don&apos;t forget the ${fee.amount} fee.
            </span>{" "}
            Pay online at{" "}
            <a
              href="https://donations.churchofjesuschrist.org/"
              target="_blank"
              rel="noreferrer"
              className="underline font-medium"
            >
              donations.churchofjesuschrist.org
            </a>{" "}
            under <span className="font-semibold">{fee.donationLine}</span>.
          </p>
        ) : null}
        <div className="mt-4 flex gap-3">
          <a
            className="btn-primary"
            href={`/api/pdf/${done.id}`}
            target="_blank"
            rel="noreferrer"
          >
            Download signed PDF
          </a>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setDone(null);
              sigRef.current?.clear();
            }}
          >
            Register another youth
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      onInvalidCapture={handleInvalidCapture}
      className="space-y-8"
    >
      <Section title="Youth information">
        <Grid>
          <Field label="First name" name="youthFirstName" required />
          <Field label="Last name" name="youthLastName" required />
          <Field
            label="Birthdate"
            name="youthBirthdate"
            type="date"
            required
            max={MAX_BIRTHDATE ?? undefined}
            helpText={BIRTHDATE_HELP}
          />
          <Select label="Gender" name="youthGender" required options={["Male", "Female"]} />
          {SINGLE_WARD ? (
            <input type="hidden" name="ward" value={SINGLE_WARD} />
          ) : (
            <Select label="Ward / branch" name="ward" required options={wards} />
          )}
        </Grid>
      </Section>

      <Section title="Address">
        <Field label="Street address" name="address" required />
        <Grid>
          <Field label="City" name="city" required />
          <Field label="State" name="state" required />
        </Grid>
      </Section>

      <TableSection title="Medical Information">
        <QARow
          question="Does the participant require a special diet?"
          name="specialDiet"
          explanationName="dietExplanation"
          explanationLabel="If yes, please explain the dietary restrictions."
        />
        <QARow
          question="Does the participant have any allergies?"
          name="hasAllergies"
          explanationName="allergies"
          explanationLabel="If yes, please list the allergies."
        />
        <FullRow
          label="List all prescription or over-the-counter (OTC) medications the participant is taking. Leave blank if none."
          name="medications"
        />
        <YesNoNoteRow
          question="Can the participant self-administer his or her medication?"
          name="selfAdminMeds"
          note="If no, please contact the event or activity leader directly."
        />
      </TableSection>

      <TableSection title="Conditions That Limit Activity">
        <QARow
          question="Does the participant have a chronic or recurring illness?"
          name="chronicIllness"
          explanationName="illnessExplanation"
          explanationLabel="If yes, please explain."
        />
        <QARow
          question="Has the participant had surgery or a serious illness in the past year?"
          name="recentSurgery"
          explanationName="surgeryExplanation"
          explanationLabel="If yes, please explain."
        />
        <FullRow
          label="Identify any other limits, restrictions, or disabilities that could prevent the participant from fully participating in the event or activity."
          name="otherLimitations"
        />
      </TableSection>

      <TableSection title="Other Accommodations or Special Needs">
        <FullRow
          label="Identify any other needs or considerations the participant has that the event or activity planner should be aware of."
          name="specialNeeds"
        />
      </TableSection>

      <Section title="Parent / guardian (also emergency contact)">
        <Grid>
          <Field label="Full name" name="parentName" required />
          <Field label="Email" name="parentEmail" type="email" required />
          <Field label="Phone" name="parentPhone" type="tel" required />
        </Grid>
      </Section>

      {fee ? (
        <section className="rounded-lg border border-amber-300 bg-amber-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-amber-900">
            Registration fee: ${fee.amount} per youth
          </h2>
          <p className="mt-2 text-sm text-amber-900">
            Pay online through the Church&apos;s donations portal. On the
            donation slip, enter <span className="font-semibold">${fee.amount}</span>{" "}
            in the <span className="font-semibold">{fee.donationLine}</span>{" "}
            line.
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-amber-900">
            <li>
              Sign in at{" "}
              <a
                href="https://donations.churchofjesuschrist.org/"
                target="_blank"
                rel="noreferrer"
                className="underline font-medium"
              >
                donations.churchofjesuschrist.org
              </a>{" "}
              (or use the Member Tools app).
            </li>
            <li>Start a new donation for your ward.</li>
            <li>
              Put <span className="font-semibold">${fee.amount}</span> under{" "}
              <span className="font-semibold">{fee.donationLine}</span>.
            </li>
            <li>Submit the donation.</li>
          </ol>

          {fee.showExampleImage ? (
            <figure className="mt-4">
              <div className="relative inline-block w-full overflow-hidden rounded-md border border-amber-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/donation-example.png"
                  alt={`Donation page with $${fee.amount} entered on the ${fee.donationLine} line`}
                  className="block w-full"
                />
                <div
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  aria-hidden
                >
                  <span className="-rotate-12 text-5xl font-black tracking-widest text-red-500/25 sm:text-7xl">
                    EXAMPLE
                  </span>
                </div>
              </div>
              <figcaption className="mt-2 text-center text-xs text-amber-900/80">
                What the donation page looks like — enter ${fee.amount} on the
                &ldquo;{fee.donationLine}&rdquo; line.
              </figcaption>
            </figure>
          ) : null}
        </section>
      ) : null}

      <Section title="Permission & signature">
        <div className="space-y-3 rounded-md bg-slate-50 p-4 text-sm text-slate-700">
          <p>
            I give permission for my child or youth (or if signing on my own
            behalf, as a leader attending this activity, I personally consent)
            to participate in the event and activities listed above (unless
            noted) and authorize the adult leaders supervising this event to
            administer emergency treatment to the above-named participant for
            any accident or illness and to act in my stead in approving
            necessary medical care. This authorization shall cover this event
            and travel to and from this event.
          </p>
          <p>
            <em className="font-semibold">Please note:</em> Units may not have
            the ability to meet all medical, physical, and other
            accommodations and are asked to counsel with parents or guardians
            on what is possible.
          </p>
          <p>
            The participant is responsible for his or her own conduct and is
            aware of and agrees to abide by Church standards, camp or event
            safety rules, and other pertinent instructions. The
            participant&apos;s conduct and interactions should abide by Church
            standards and exemplify Christlike behavior, including those
            listed on the attached &ldquo;Conduct at Church Activities.&rdquo;
          </p>
          <p>
            Parents and participants should understand that participation in
            an activity is not a right but a privilege that can be revoked if
            participants behave inappropriately or if they pose a risk to
            themselves or others.
          </p>
          <p>
            This information is collected to help event and activity leaders
            or medical personnel so they can be prepared and appropriately
            respond to health concerns or an emergency. It will be kept
            confidential and shared only as needed.
          </p>
        </div>

        <div>
          <label className="label" htmlFor="signatureName">
            Signed by (typed name)
          </label>
          <input id="signatureName" name="signatureName" required className="field" />
        </div>

        <div>
          <label className="label">Signature</label>
          <div className="rounded-md border border-slate-300 bg-white">
            <SignaturePad
              onReady={(r) => {
                sigRef.current = r;
              }}
              canvasProps={{
                className: "w-full h-40 rounded-md",
              }}
            />
          </div>
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              className="text-sm text-slate-500 underline"
              onClick={() => sigRef.current?.clear()}
            >
              Clear signature
            </button>
          </div>
        </div>
      </Section>

      {error ? (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
      ) : null}

      <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base">
        {submitting ? "Submitting…" : "Sign & register"}
      </button>
    </form>
  );
}
