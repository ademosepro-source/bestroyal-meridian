import { createClient } from "@/lib/supabase/server";
import { CsvExportButton } from "@/components/dashboard/csv-export-button";
import { PrintButton } from "@/components/dashboard/print-button";

export default async function StudentRegisterReportPage({
  searchParams,
}: {
  searchParams: Promise<{ class_id?: string; status?: string }>;
}) {
  const { class_id, status } = await searchParams;
  const supabase = await createClient();

  const { data: classes } = await supabase.from("classes").select("id, name").order("order_index");

  let query = supabase
    .from("students")
    .select("admission_number, first_name, middle_name, surname, gender, date_of_birth, class_id, status, admission_date")
    .order("surname");

  if (class_id) query = query.eq("class_id", class_id);
  if (status) query = query.eq("status", status as "active" | "withdrawn" | "graduated");

  const { data: students } = await query;
  const classNameById = new Map((classes ?? []).map((c) => [c.id, c.name]));

  const rows = (students ?? []).map((s) => ({
    "Admission No.": s.admission_number,
    "First Name": s.first_name,
    "Middle Name": s.middle_name ?? "",
    Surname: s.surname,
    Gender: s.gender,
    "Date of Birth": s.date_of_birth,
    Class: (s.class_id && classNameById.get(s.class_id)) || "",
    Status: s.status,
    "Admission Date": s.admission_date,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
            Student Register
          </h1>
          <p className="mt-1 text-sm text-slate-500">{rows.length} student(s)</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <CsvExportButton rows={rows} filename="student-register" />
          <PrintButton />
        </div>
      </div>

      <form method="get" className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-900/5 print:hidden">
        <select name="class_id" defaultValue={class_id ?? ""} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm">
          <option value="">All classes</option>
          {(classes ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="graduated">Graduated</option>
        </select>
        <button className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">Filter</button>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5 print:shadow-none print:ring-0">
        <table className="w-full text-sm">
          <thead className="bg-navy-50/60 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Adm. No.</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Admitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-900/5">
            {(students ?? []).map((s) => (
              <tr key={s.admission_number}>
                <td className="px-4 py-2.5">{s.admission_number}</td>
                <td className="px-4 py-2.5 font-medium text-navy-900">{s.first_name} {s.surname}</td>
                <td className="px-4 py-2.5 capitalize">{s.gender}</td>
                <td className="px-4 py-2.5">{(s.class_id && classNameById.get(s.class_id)) || "—"}</td>
                <td className="px-4 py-2.5 capitalize">{s.status}</td>
                <td className="px-4 py-2.5">{s.admission_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
