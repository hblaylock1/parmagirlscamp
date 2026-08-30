import Link from "next/link";
import RegistrationForm from "./_components/RegistrationForm";
import Sunburst from "./_components/Sunburst";
import { EVENT } from "@/lib/event";

export default function Page() {
  return (
    <div className="bg-stripes min-h-screen">
      <main className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8 text-center">
          {EVENT.eyebrowLine ? (
            <p className="font-script text-2xl text-brand-700 sm:text-3xl">
              {EVENT.eyebrowLine}
            </p>
          ) : null}
          {EVENT.tagline ? (
            <p className="mt-1 font-script text-xl text-brand-700 sm:text-2xl">
              {EVENT.tagline}
            </p>
          ) : null}

          <h1 className="text-shadow-navy mt-4 font-display text-3xl uppercase tracking-wide text-gold-500 sm:text-5xl">
            {EVENT.title}
          </h1>

          <div className="mx-auto mt-5 inline-block rounded-md border border-gold-400 bg-white/80 px-5 py-3 text-left shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              {EVENT.dateBannerLabel}
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {EVENT.dateLine}
            </p>
            <p className="text-sm text-slate-700">{EVENT.timeLine}</p>
          </div>

          {EVENT.themeGraphic ? (
            <div className="mt-6">
              <Sunburst
                lines={EVENT.themeGraphic.lines}
                reference={EVENT.themeGraphic.reference}
              />
            </div>
          ) : null}

          <p className="mx-auto mt-6 max-w-xl text-slate-700">
            Fill out this form to sign your child up for {EVENT.shortName}. A
            parent or guardian must sign the permission slip at the bottom.
            You&apos;ll get a confirmation page when you&apos;re done.
          </p>

          {EVENT.reminders && EVENT.reminders.length > 0 ? (
            <div className="mx-auto mt-6 grid max-w-xl gap-3 text-left sm:grid-cols-2">
              {EVENT.reminders.map((r) => (
                <div
                  key={r.heading}
                  className="rounded-md border border-brand-200 bg-white/80 px-4 py-3"
                >
                  <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                    {r.heading}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{r.body}</p>
                </div>
              ))}
            </div>
          ) : null}
        </header>

        <RegistrationForm />

        <footer className="mt-10 flex justify-center gap-4 text-center text-sm text-slate-600">
          <Link href="/share" className="underline hover:text-slate-800">
            Share / print
          </Link>
          <span>·</span>
          <Link href="/admin" className="underline hover:text-slate-800">
            Admin
          </Link>
        </footer>
      </main>
    </div>
  );
}
