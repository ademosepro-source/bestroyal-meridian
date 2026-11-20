import Link from "next/link";
import { Banknote, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-user";
import { EmptyState } from "@/components/ui/empty-state";
import { outstandingBalance } from "@/lib/finance/invoices";

export default async function ParentDashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("parent_student")
    .select("student_id, relationship")
    .eq("parent_id", profile?.id ?? "");

  const studentIds = (links ?? []).map((link) => link.student_id);

  const { data: children } =
    studentIds.length > 0
      ? await supabase
          .from("students")
          .select("id, first_name, surname, admission_number, class_id")
          .in("id", studentIds)
      : { data: [] };

  const classIds = (children ?? []).map((c) => c.class_id).filter((id): id is string => !!id);

  const { data: classes } =
    classIds.length > 0
      ? await supabase.from("classes").select("id, name").in("id", classIds)
      : { data: [] };

  const classNameById = new Map((classes ?? []).map((c) => [c.id, c.name]));

  const { data: recentAttendance } =
    studentIds.length > 0
      ? await supabase
          .from("attendance_records")
          .select("student_id, date, status")
          .in("student_id", studentIds)
          .order("date", { ascending: false })
          .limit(5 * studentIds.length)
      : { data: [] };

  const attendanceByStudent = new Map<string, { date: string; status: string }[]>();
  for (const record of recentAttendance ?? []) {
    const list = attendanceByStudent.get(record.student_id) ?? [];
    if (list.length < 5) list.push({ date: record.date, status: record.status });
    attendanceByStudent.set(record.student_id, list);
  }

  const { data: publishedReportCards } =
    studentIds.length > 0
      ? await supabase
          .from("report_cards")
          .select("student_id, term_id")
          .in("student_id", studentIds)
          .eq("status", "published")
          .order("published_at", { ascending: false })
      : { data: [] };

  // Most recently published wins per child, in case more than one term's
  // report card has ever been published for them.
  const reportCardByStudent = new Map<string, string>();
  for (const r of publishedReportCards ?? []) {
    if (!reportCardByStudent.has(r.student_id)) reportCardByStudent.set(r.student_id, r.term_id);
  }

  const { data: invoices } =
    studentIds.length > 0
      ? await supabase.from("invoices").select("id").in("student_id", studentIds)
      : { data: [] };
  const invoiceIds = (invoices ?? []).map((i) => i.id);

  const [{ data: allItems }, { data: allPayments }] = await Promise.all([
    invoiceIds.length ? supabase.from("invoice_items").select("invoice_id, amount").in("invoice_id", invoiceIds) : { data: [] },
    invoiceIds.length ? supabase.from("payments").select("invoice_id, amount, status").in("invoice_id", invoiceIds) : { data: [] },
  ]);

  const totalOutstanding = invoiceIds.reduce((sum, id) => {
    const invItems = (allItems ?? []).filter((i) => i.invoice_id === id);
    const invPayments = (allPayments ?? []).filter((p) => p.invoice_id === id);
    return sum + outstandingBalance(invItems, invPayments);
  }, 0);

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, body, published_at")
    .in("audience", ["parents", "class"])
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Welcome, {profile?.full_name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          You can only see children linked to your account.
        </p>
      </div>

      {!children || children.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No children linked yet"
          description="Ask school management to link your account to your child's student record."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {children.map((child) => (
            <div key={child.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
              <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-navy-900">
                {child.first_name} {child.surname}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {(child.class_id && classNameById.get(child.class_id)) || "Class not assigned"} · Adm.
                No. {child.admission_number}
              </p>

              <div className="mt-4 border-t border-navy-900/5 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Recent Attendance
                </p>
                {(attendanceByStudent.get(child.id)?.length ?? 0) === 0 ? (
                  <p className="mt-2 text-xs text-slate-400">No attendance recorded yet.</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-xs">
                    {attendanceByStudent.get(child.id)!.map((r) => (
                      <li key={r.date} className="flex justify-between">
                        <span className="text-slate-500">{r.date}</span>
                        <span className="font-medium capitalize text-navy-700">{r.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {reportCardByStudent.has(child.id) && (
                <Link
                  href={`/dashboard/report-cards/${child.id}/${reportCardByStudent.get(child.id)}`}
                  className="mt-4 inline-flex rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-navy-950 hover:bg-gold-400"
                >
                  View Report Card
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      <Link
        href="/dashboard/parent/fees"
        className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5 hover:bg-navy-50/40"
      >
        <span className="flex items-center gap-3">
          <Banknote className="h-5 w-5 text-gold-600" />
          <span className="font-medium text-navy-900">School Fees</span>
        </span>
        <span className={`font-semibold ${totalOutstanding > 0 ? "text-crimson-600" : "text-emerald-600"}`}>
          {totalOutstanding > 0 ? `₦${totalOutstanding.toLocaleString()} outstanding` : "Fully paid"}
        </span>
      </Link>

      {announcements && announcements.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Announcements</p>
          <ul className="mt-3 space-y-3">
            {announcements.map((a) => (
              <li key={a.id} className="border-b border-navy-900/5 pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-navy-900">{a.title}</p>
                <p className="mt-0.5 text-sm text-slate-600">{a.body}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(a.published_at).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
