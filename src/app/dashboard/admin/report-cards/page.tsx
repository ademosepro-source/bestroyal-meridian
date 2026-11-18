import Link from "next/link";
import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-user";
import { EmptyState } from "@/components/ui/empty-state";
import { approveReportCard, publishReportCard } from "@/app/dashboard/admin/report-cards/actions";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  published: "bg-navy-900 text-white",
};

export default async function AdminReportCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  let query = supabase
    .from("report_cards")
    .select("id, student_id, class_id, term_id, status, teacher_comment")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status as "draft" | "submitted" | "approved" | "published");

  const { data: reportCards } = await query;

  const studentIds = [...new Set((reportCards ?? []).map((r) => r.student_id))];
  const classIds = [...new Set((reportCards ?? []).map((r) => r.class_id))];
  const termIds = [...new Set((reportCards ?? []).map((r) => r.term_id))];

  const [{ data: students }, { data: classes }, { data: terms }] = await Promise.all([
    studentIds.length ? supabase.from("students").select("id, first_name, surname").in("id", studentIds) : { data: [] },
    classIds.length ? supabase.from("classes").select("id, name").in("id", classIds) : { data: [] },
    termIds.length ? supabase.from("terms").select("id, name").in("id", termIds) : { data: [] },
  ]);

  const studentById = new Map((students ?? []).map((s) => [s.id, s]));
  const classNameById = new Map((classes ?? []).map((c) => [c.id, c.name]));
  const termNameById = new Map((terms ?? []).map((t) => [t.id, t.name]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Report Cards
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review what teachers submit, approve, then publish so parents can see it.
        </p>
      </div>

      <div className="flex gap-2">
        {["", "submitted", "approved", "published", "draft"].map((s) => (
          <Link
            key={s || "all"}
            href={s ? `/dashboard/admin/report-cards?status=${s}` : "/dashboard/admin/report-cards"}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
              (status ?? "") === s ? "bg-navy-900 text-white" : "bg-white text-navy-700 ring-1 ring-navy-900/10"
            }`}
          >
            {s || "All"}
          </Link>
        ))}
      </div>

      {!reportCards || reportCards.length === 0 ? (
        <EmptyState icon={FileText} title="No report cards" description="Report cards appear here once a class teacher submits them." />
      ) : (
        <div className="space-y-3">
          {reportCards.map((rc) => {
            const student = studentById.get(rc.student_id);
            return (
              <div key={rc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-900/5">
                <div>
                  <p className="font-medium text-navy-900">{student?.first_name} {student?.surname}</p>
                  <p className="text-xs text-slate-500">{classNameById.get(rc.class_id)} · {termNameById.get(rc.term_id)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[rc.status]}`}>{rc.status}</span>
                  <Link href={`/dashboard/report-cards/${rc.student_id}/${rc.term_id}`} className="text-sm font-semibold text-navy-700 hover:text-navy-900">
                    Preview
                  </Link>

                  {rc.status === "submitted" && profile && ["super_admin", "principal"].includes(profile.role) && (
                    <form action={approveReportCard.bind(null, rc.id)}>
                      <input type="hidden" name="principal_comment" value="" />
                      <button className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                        Approve
                      </button>
                    </form>
                  )}

                  {rc.status === "approved" && profile?.role === "super_admin" && (
                    <form action={publishReportCard.bind(null, rc.id)}>
                      <button className="rounded-full bg-gold-500 px-4 py-1.5 text-xs font-semibold text-navy-950 hover:bg-gold-400">
                        Publish
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
