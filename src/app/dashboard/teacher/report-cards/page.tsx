import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-user";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";
import { getClassTermSummaries } from "@/lib/academics/report-card-data";
import { ordinal } from "@/lib/academics/grading";
import { submitReportCard } from "@/app/dashboard/teacher/report-cards/actions";

export default async function TeacherReportCardsPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: classTeacherOf } = await supabase
    .from("teacher_class_assignments")
    .select("class_id")
    .eq("teacher_id", profile?.id ?? "")
    .eq("is_class_teacher", true)
    .maybeSingle();

  if (!classTeacherOf) {
    return (
      <EmptyState
        icon={FileText}
        title="You are not a class teacher"
        description="Only the class teacher for a class submits that class's report cards. Ask school management if this is incorrect."
      />
    );
  }

  const { data: currentTerm } = await supabase.from("terms").select("id, name").eq("is_current", true).maybeSingle();
  if (!currentTerm) {
    return <EmptyState icon={FileText} title="No current term set" description="Ask an administrator to mark a term as current." />;
  }

  const [{ data: students }, { data: existingCards }] = await Promise.all([
    supabase
      .from("students")
      .select("id, first_name, surname")
      .eq("class_id", classTeacherOf.class_id)
      .eq("status", "active")
      .order("surname"),
    supabase.from("report_cards").select("student_id, status, teacher_comment, promotion_status").eq("class_id", classTeacherOf.class_id).eq("term_id", currentTerm.id),
  ]);

  const summaries = await getClassTermSummaries(supabase, classTeacherOf.class_id, currentTerm.id);
  const cardByStudent = new Map((existingCards ?? []).map((c) => [c.student_id, c]));

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Report Cards — {currentTerm.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overall average is computed automatically from scores entered by subject teachers.
        </p>
      </div>

      {!students || students.length === 0 ? (
        <EmptyState icon={FileText} title="No students in this class" description="Register students into this class first." />
      ) : (
        <div className="space-y-4">
          {students.map((student) => {
            const summary = summaries.get(student.id);
            const card = cardByStudent.get(student.id);
            const locked = card?.status === "approved" || card?.status === "published";

            return (
              <div key={student.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-navy-900">{student.first_name} {student.surname}</p>
                  <div className="text-sm text-slate-500">
                    Average: <span className="font-semibold text-navy-800">{summary ? summary.overallAverage.toFixed(1) : "—"}</span>
                    {" · "}
                    Position: <span className="font-semibold text-navy-800">{summary?.position ? ordinal(summary.position) : "—"}</span>
                    {card && (
                      <span className="ml-2 rounded-full bg-navy-50 px-2 py-0.5 text-xs font-medium capitalize text-navy-700">{card.status}</span>
                    )}
                  </div>
                </div>

                <form action={submitReportCard.bind(null, student.id, classTeacherOf.class_id, currentTerm.id)} className="mt-4 space-y-3">
                  <textarea
                    name="teacher_comment"
                    rows={2}
                    placeholder="Teacher's comment"
                    defaultValue={card?.teacher_comment ?? ""}
                    disabled={locked}
                    className="w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm outline-none focus:border-navy-500 disabled:bg-slate-50"
                  />
                  <input
                    name="promotion_status"
                    placeholder="Promotion status (e.g. Promoted to Primary 4)"
                    defaultValue={card?.promotion_status ?? ""}
                    disabled={locked}
                    className="w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm outline-none focus:border-navy-500 disabled:bg-slate-50"
                  />
                  <button
                    type="submit"
                    disabled={locked}
                    className="rounded-full bg-navy-900 px-5 py-2 text-xs font-semibold text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {card ? "Update & Re-submit" : "Submit for Approval"}
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
