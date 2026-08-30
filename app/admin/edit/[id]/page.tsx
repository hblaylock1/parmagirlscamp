import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listRegistrations } from "@/lib/storage";
import { WARDS } from "@/lib/wards";
import EditRegistrationForm from "./EditRegistrationForm";

export const dynamic = "force-dynamic";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const rows = await listRegistrations();
  const row = rows.find((r) => r.id === id);
  if (!row) notFound();
  if (session.role === "ward" && row.ward !== session.ward) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <Link href="/admin" className="text-sm text-slate-500 underline">
          ← Back to roster
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Edit registration
        </h1>
        <p className="text-sm text-slate-600">
          {row.youthFirstName} {row.youthLastName} • {row.ward}
        </p>
        <p className="mt-2 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
          Changes here update the roster and CSV export. The originally signed
          PDF is preserved as-is and is not regenerated.
        </p>
      </header>

      <EditRegistrationForm
        registration={row}
        wards={[...WARDS]}
        canChangeWard={session.role === "admin"}
      />
    </main>
  );
}
