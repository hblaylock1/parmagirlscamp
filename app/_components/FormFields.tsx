"use client";

import { useState } from "react";

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function TableSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <h2 className="border-b border-slate-200 bg-slate-50 px-6 py-3 text-base font-semibold text-slate-900">
        {title}
      </h2>
      <div className="divide-y divide-slate-200">{children}</div>
    </section>
  );
}

export function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

export function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
  max,
  helpText,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  max?: string;
  helpText?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        max={max}
        className="field"
      />
      {helpText ? (
        <p className="mt-1 text-xs text-slate-500">{helpText}</p>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  name,
  options,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        className="field"
        defaultValue={defaultValue ?? ""}
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function YesNoRadios({
  name,
  value,
  onChange,
  required = true,
}: {
  name: string;
  value: "yes" | "no" | null;
  onChange: (v: "yes" | "no") => void;
  required?: boolean;
}) {
  const radio = "h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500";
  return (
    <div className="flex items-center gap-4 text-sm text-slate-700">
      <label className="inline-flex items-center gap-1.5">
        <input
          type="radio"
          name={name}
          value="yes"
          checked={value === "yes"}
          onChange={() => onChange("yes")}
          required={required}
          className={radio}
        />
        Yes
      </label>
      <label className="inline-flex items-center gap-1.5">
        <input
          type="radio"
          name={name}
          value="no"
          checked={value === "no"}
          onChange={() => onChange("no")}
          required={required}
          className={radio}
        />
        No
      </label>
    </div>
  );
}

export function QARow({
  question,
  name,
  explanationName,
  explanationLabel,
  initialYesNo = null,
  initialExplanation = "",
}: {
  question: string;
  name: string;
  explanationName: string;
  explanationLabel: string;
  initialYesNo?: boolean | null;
  initialExplanation?: string;
}) {
  const [value, setValue] = useState<"yes" | "no" | null>(
    initialYesNo === true ? "yes" : initialYesNo === false ? "no" : null,
  );
  const isYes = value === "yes";
  const disabled = !isYes;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className="border-b border-slate-200 p-4 md:border-b-0 md:border-r">
        <p className="text-sm font-medium text-slate-800">{question}</p>
        <div className="mt-2">
          <YesNoRadios name={name} value={value} onChange={setValue} />
        </div>
      </div>
      <div className="p-4">
        <label htmlFor={explanationName} className="mb-2 block text-sm text-slate-600">
          {explanationLabel}
          {isYes ? <span className="text-red-500"> *</span> : null}
        </label>
        <input
          id={explanationName}
          name={explanationName}
          required={isYes}
          disabled={disabled}
          defaultValue={initialExplanation}
          className={`field ${
            disabled ? "cursor-not-allowed bg-slate-100 text-slate-400" : ""
          }`}
        />
      </div>
    </div>
  );
}

export function YesNoNoteRow({
  question,
  name,
  note,
  initialYesNo = null,
}: {
  question: string;
  name: string;
  note: string;
  initialYesNo?: boolean | null;
}) {
  const [value, setValue] = useState<"yes" | "no" | null>(
    initialYesNo === true ? "yes" : initialYesNo === false ? "no" : null,
  );
  return (
    <div className="p-4">
      <p className="text-sm font-medium text-slate-800">{question}</p>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <YesNoRadios name={name} value={value} onChange={setValue} />
        <span className="text-sm text-slate-600">{note}</span>
      </div>
    </div>
  );
}

export function FullRow({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <div className="p-4">
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-slate-800">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        className="field"
      />
    </div>
  );
}
