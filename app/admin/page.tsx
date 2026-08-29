import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { listRegistrations } from "@/lib/storage";
import { EVENT, SINGLE_WARD } from "@/lib/event";
import { formatMountainDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ ward?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const isAdmin = session.role === "admin";
  const showWardSidebar = isAdmin && !SINGLE_WARD;
  const { ward: requestedFilter } = await searchParams;

  const all = await listRegistrations();
  const visible = isAdmin ? all : all.filter((r) => r.ward === session.ward);

  // Ward admins are locked to their ward; stake admins can filter.
  const wardFilter = isAdmin ? requestedFilter : session.ward;
  const rows = wardFilter ? visible.filter((r) => r.ward === wardFilter) : visible;

  const byWard = new Map<string, number>();
  for (const r of all) byWard.set(r.ward, (byWard.get(r.ward) ?? 0) + 1);

  const exportHref = wardFilter
    ? `/api/admin/export?ward=${encodeURIComponent(wardFilter)}`
    : "/api/admin/export";

  const titleSuffix = `${EVENT.shortName} Admin`;
  const titleText = isAdmin ? titleSuffix : `${session.ward} — ${EVENT.shortName}`;
  const scopeLabel = isAdmin
    ? `${all.length} total ${all.length === 1 ? "registration" : "registrations"}${wardFilter ? ` • filtered to ${wardFilter}` : ""}`
    : `${session.ward} — ${rows.length} ${rows.length === 1 ? "registration" : "registrations"}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{titleText}</h1>
          <p className="text-sm text-slate-600">{scopeLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="btn-secondary text-sm">
            Registration page
          </Link>
          <form method="POST" action="/api/admin/logout">
            <button className="btn-secondary text-sm">Sign out</button>
          </form>
        </div>
      </header>

      <section className={`mt-6 grid gap-6 ${showWardSidebar ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
        {showWardSidebar ? (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700">By ward</h2>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <Link
                  href="/admin"
                  className={!wardFilter ? "font-semibold text-brand-700" : "text-slate-700 hover:underline"}
                >
                  All wards ({all.length})
                </Link>
              </li>
              {EVENT.wards.map((w) => (
                <li key={w}>
                  <Link
                    href={`/admin?ward=${encodeURIComponent(w)}`}
                    className={
                      wardFilter === w
                        ? "font-semibold text-brand-700"
                        : "text-slate-700 hover:underline"
                    }
                  >
                    {w} ({byWard.get(w) ?? 0})
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Export</h2>
          <p className="mt-2 text-sm text-slate-600">
            Download a CSV of the
            {showWardSidebar
              ? wardFilter
                ? " selected ward's"
                : " full"
              : ""} roster.
          </p>
          <a href={exportHref} className="btn-primary mt-3 w-full">Download CSV</a>
        </div>
      </section>

      {isAdmin ? (
        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Registration QR code</h2>
              <p className="mt-1 text-sm text-slate-600">
                Share this QR on flyers or post it in the ward building. Parents
                scan it to reach the registration form.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link href="/share" className="btn-primary">
                  Open share / print page
                </Link>
                <a href="/qr-code.jpg" download className="btn-secondary">
                  Download QR image
                </a>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/qr-code.jpg"
              alt={`QR code to the ${EVENT.shortName} registration page`}
              className="h-32 w-32 rounded border border-slate-200 object-contain"
            />
          </div>
        </section>
      ) : null}

      <section className="mt-8 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <Th>Youth</Th>
                {showWardSidebar ? <Th>Ward</Th> : null}
                <Th>Parent</Th>
                <Th>Contact</Th>
                <Th>Signed</Th>
                <Th>PDF</Th>
                <Th>Edit</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={showWardSidebar ? 7 : 6} className="py-8 text-center text-slate-500">
                    No registrations{wardFilter && isAdmin && !SINGLE_WARD ? ` for ${wardFilter}` : ""} yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <Td>
                      <div className="font-medium text-slate-900">
                        {r.youthFirstName} {r.youthLastName}
                      </div>
                      <div className="text-xs text-slate-500">{r.youthBirthdate}</div>
                    </Td>
                    {showWardSidebar ? <Td>{r.ward}</Td> : null}
                    <Td>
                      <div>{r.parentName}</div>
                      <div className="text-xs text-slate-500">{r.parentEmail}</div>
                    </Td>
                    <Td>
                      <div>{r.parentPhone}</div>
                    </Td>
                    <Td className="whitespace-nowrap text-xs text-slate-500">
                      {formatMountainDateTime(r.signedAt)}
                    </Td>
                    <Td>
                      <a
                        href={`/api/admin/pdf/${r.id}`}
                        className="text-brand-600 hover:underline"
                      >
                        Download
                      </a>
                    </Td>
                    <Td>
                      <Link
                        href={`/admin/edit/${r.id}`}
                        className="text-brand-600 hover:underline"
                      >
                        Edit
                      </Link>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className ?? ""}`}>{children}</td>;
}
