import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import type { StudentStatus } from "@/types/database";
import { getCurrentProfile } from "@/lib/auth/get-current-user";
import { deleteStudent } from "@/app/dashboard/admin/students/actions";
import { ConfirmDeleteButton } from "@/components/dashboard/confirm-delete-button";

const VALID_STATUSES: StudentStatus[] = ["active", "withdrawn", "graduated"];

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; class_id?: string; status?: string }>;
}) {
  const { q, class_id, status } = await searchParams;
  const supabase = await createClient();
  const currentProfile = await getCurrentProfile();
  const canDelete = currentProfile?.role === "super_admin";

  const { data: classes } = await supabase.from("classes").select("id, name").order("order_index");

  let query = supabase
    .from("students")
    .select("id, first_name, surname, admission_number, gender, status, class_id")
    .order("surname");

  if (q) {
    query = query.or(`first_name.ilike.%${q}%,surname.ilike.%${q}%,admission_number.ilike.%${q}%`);
  }
  if (class_id) query = query.eq("class_id", class_id);
  if (status && VALID_STATUSES.includes(status as StudentStatus)) {
    query = query.eq("status", status as StudentStatus);
  }

  const { data: students } = await query;
  const classNameById = new Map((classes ?? []).map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
            Students
          </h1>
          <p className="mt-1 text-sm text-slate-500">Register, search and manage student records.</p>
        </div>
        <Link
          href="/dashboard/admin/students/new"
          className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-gold-400"
        >
          <Plus className="h-4 w-4" /> Register Student
        </Link>
      </div>

      <form className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-900/5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by name or admission number"
            className="w-full rounded-lg border border-navy-900/15 py-2 pl-9 pr-3 text-sm outline-none focus:border-navy-500"
          />
        </div>
        <select
          name="class_id"
          defaultValue={class_id ?? ""}
          className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm outline-none focus:border-navy-500"
        >
          <option value="">All classes</option>
          {(classes ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm outline-none focus:border-navy-500"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="graduated">Graduated</option>
        </select>
        <button className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
          Filter
        </button>
      </form>

      {!students || students.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No students found"
          description="Try a different search, or register your first student."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5">
          <table className="w-full text-sm">
            <thead className="bg-navy-50/60 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Admission No.</th>
                <th className="px-5 py-3">Class</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-navy-50/40">
                  <td className="px-5 py-3 font-medium text-navy-900">
                    {s.first_name} {s.surname}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{s.admission_number}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {(s.class_id && classNameById.get(s.class_id)) || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        s.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : s.status === "withdrawn"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/dashboard/admin/students/${s.id}`} className="text-sm font-semibold text-navy-700 hover:text-navy-900">
                        View / Edit
                      </Link>
                      {canDelete && (
                        <form action={deleteStudent.bind(null, s.id)}>
                          <ConfirmDeleteButton
                            confirmMessage={`Delete ${s.first_name} ${s.surname}'s record? This removes their attendance, scores, report cards and invoices too, and cannot be undone.`}
                          />
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
