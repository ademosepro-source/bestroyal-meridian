import { createClient } from "@/lib/supabase/server";
import { CsvExportButton } from "@/components/dashboard/csv-export-button";
import { PrintButton } from "@/components/dashboard/print-button";
import type { ApplicationStatus } from "@/types/database";

export default async function AdmissionRegisterReportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string }>;
}) {
  const { status, from, to } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("admission_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status as ApplicationStatus);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", `${to}T23:59:59`);

  const { data: applications } = await query;

  const rows = (applications ?? []).map((a) => ({
    "Applicant Name": `${a.applicant_first_name} ${a.applicant_surname}`,
    "Date of Birth": a.date_of_birth,
    Gender: a.gender,
    "Parent Name": a.parent_full_name,
    "Parent Phone": a.parent_phone,
    "Parent Email": a.parent_email,
    Status: a.status,
    "Submitted On": new Date(a.created_at).toLocaleDateString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
            Admission Register
          </h1>
          <p className="mt-1 text-sm text-slate-500">{rows.length} application(s)</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <CsvExportButton rows={rows} filename="admission-register" />
          <PrintButton />
        </div>
      </div>

      <form method="get" className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-900/5 print:hidden">
        <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="enrolled">Enrolled</option>
        </select>
        <input type="date" name="from" defaultValue={from} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm" />
        <input type="date" name="to" defaultValue={to} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm" />
        <button className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">Filter</button>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5 print:shadow-none print:ring-0">
        <table className="w-full text-sm">
          <thead className="bg-navy-50/60 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-900/5">
            {(applications ?? []).map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-2.5 font-medium text-navy-900">{a.applicant_first_name} {a.applicant_surname}</td>
                <td className="px-4 py-2.5">{a.parent_full_name}</td>
                <td className="px-4 py-2.5">{a.parent_phone}</td>
                <td className="px-4 py-2.5 capitalize">{a.status.replace("_", " ")}</td>
                <td className="px-4 py-2.5">{new Date(a.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
