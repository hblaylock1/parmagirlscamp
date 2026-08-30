import Link from "next/link";
import PrintShareButtons from "../_components/PrintShareButtons";
import { EVENT } from "@/lib/event";

export const metadata = {
  title: `Share ${EVENT.shortName} — scan to register`,
};

export default function SharePage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10 print:py-4">
      <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>

      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
          {EVENT.title}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900 print:text-4xl">
          Scan to register your youth
        </h1>
        <p className="mt-3 text-slate-600 print:text-lg">
          Point your phone camera at the code below, then fill out the form and
          sign the permission slip.
        </p>
        <p className="mt-2 text-sm text-slate-700 print:text-base">
          {EVENT.dateLine} • {EVENT.timeLine}
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/qr-code.jpg"
            alt={`QR code to the ${EVENT.shortName} registration page`}
            className="h-72 w-72 object-contain print:h-96 print:w-96"
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <PrintShareButtons />
        <Link href="/" className="no-print text-sm text-slate-500 underline">
          Back to registration
        </Link>
      </div>
    </main>
  );
}
