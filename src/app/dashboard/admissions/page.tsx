import Link from "next/link";
import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import type { ApplicationStatus } from "@/types/database";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  under_review: "bg-amber-50 text-amber-700",
  accepted: "bg-emerald-50 text-emerald-700",
  rejected: "bg-crimson-500/10 text-crimson-600",
  enrolled: "bg-navy-900 text-white",
};

const VALID_STATUSES: ApplicationStatus[] = ["pending", "under_review", "accepted", "rejected", "enrolled"];

export default async function AdmissionsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("admission_applications")
    .select("id, applicant_first_name, applicant_surname, parent_full_name, parent_phone, status, created_at")
    .order("created_at", { ascending: false });

  if (status && VALID_STATUSES.includes(status as ApplicationStatus)) {
    query = query.eq("status", status as ApplicationStatus);
  }

  const { data: applications } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Admission Applications
        </h1>
        <p className="mt-1 text-sm text-slate-500">Review enquiries submitted through the website.</p>
      </div>

      <div className="flex gap-2">
        {["", "pending", "under_review", "accepted", "rejected", "enrolled"].map((s) => (
          <Link
            key={s || "all"}
            href={s ? `/dashboard/admissions?status=${s}` : "/dashboard/admissions"}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
              (status ?? "") === s ? "bg-navy-900 text-white" : "bg-white text-navy-700 ring-1 ring-navy-900/10"
            }`}
          >
            {s.replace("_", " ") || "All"}
          </Link>
        ))}
      </div>

      {!applications || applications.length === 0 ? (
        <EmptyState icon={FileText} title="No applications" description="Applications submitted on the website will appear here." />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5">
          <table className="w-full text-sm">
            <thead className="bg-navy-50/60 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Child</th>
                <th className="px-5 py-3">Parent</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5">
              {applications.map((a) => (
                <tr key={a.id} className="cursor-pointer hover:bg-navy-50/40">
                  <td className="px-5 py-3 font-medium text-navy-900">
                    <Link href={`/dashboard/admissions/${a.id}`}>{a.applicant_first_name} {a.applicant_surname}</Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{a.parent_full_name}</td>
                  <td className="px-5 py-3 text-slate-600">{a.parent_phone}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[a.status]}`}>
                      {a.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{new Date(a.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
