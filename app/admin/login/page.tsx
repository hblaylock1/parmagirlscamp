import { EVENT } from "@/lib/event";

export const dynamic = "force-dynamic";

const ADMIN_VALUE = "__admin";

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const single = EVENT.authMode === "single";

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Admin login</h1>
      <p className="mt-2 text-sm text-slate-600">
        {single
          ? "Enter the admin password to view registrations."
          : "Select your ward and enter the password given to you by stake leadership. Stake admins choose “All wards”."}
      </p>
      <form method="POST" action="/api/admin/login" className="mt-6 space-y-4">
        {single ? null : (
          <div>
            <label className="label" htmlFor="ward">Ward</label>
            <select
              id="ward"
              name="ward"
              required
              className="field"
              defaultValue=""
            >
              <option value="" disabled>
                Select…
              </option>
              <option value={ADMIN_VALUE}>All wards (stake admin)</option>
              {EVENT.wards.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="field"
          />
        </div>
        {error ? (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {single ? "Incorrect password." : "Incorrect ward or password."}
          </p>
        ) : null}
        <button className="btn-primary w-full py-2.5">Sign in</button>
      </form>
    </main>
  );
}
