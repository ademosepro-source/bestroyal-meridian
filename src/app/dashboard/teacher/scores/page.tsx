import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-user";
import { EmptyState } from "@/components/ui/empty-state";
import { GraduationCap } from "lucide-react";
import { ScoreEntryForm } from "@/components/dashboard/score-entry-form";

export default async function TeacherScoresPage({
  searchParams,
}: {
  searchParams: Promise<{ pair?: string }>;
}) {
  const { pair } = await searchParams;
  const [class_id, subject_id] = pair ? pair.split("_") : [undefined, undefined];
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: assignments }, { data: currentTerm }, { data: components }] = await Promise.all([
    supabase.from("subject_teachers").select("class_id, subject_id").eq("teacher_id", profile?.id ?? ""),
    supabase.from("terms").select("id, name").eq("is_current", true).maybeSingle(),
    supabase.from("assessment_components").select("id, name, max_score").order("order_index"),
  ]);

  if (!assignments || assignments.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No subject assigned yet"
        description="Ask school management to assign you to teach a subject before you can enter scores."
      />
    );
  }

  if (!currentTerm) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No current term set"
        description="Ask an administrator to mark a term as current under Academic Sessions."
      />
    );
  }

  const [{ data: classes }, { data: subjects }] = await Promise.all([
    supabase.from("classes").select("id, name").in("id", assignments.map((a) => a.class_id)),
    supabase.from("subjects").select("id, name").in("id", assignments.map((a) => a.subject_id)),
  ]);

  const classNameById = new Map((classes ?? []).map((c) => [c.id, c.name]));
  const subjectNameById = new Map((subjects ?? []).map((s) => [s.id, s.name]));

  const selected = class_id && subject_id
    ? assignments.find((a) => a.class_id === class_id && a.subject_id === subject_id)
    : assignments[0];

  const selectedClassId = selected?.class_id ?? assignments[0].class_id;
  const selectedSubjectId = selected?.subject_id ?? assignments[0].subject_id;

  const { data: students } = await supabase
    .from("students")
    .select("id, first_name, surname")
    .eq("class_id", selectedClassId)
    .eq("status", "active")
    .order("surname");

  const { data: existingScores } = await supabase
    .from("exam_scores")
    .select("student_id, component_id, score")
    .eq("class_id", selectedClassId)
    .eq("subject_id", selectedSubjectId)
    .eq("term_id", currentTerm.id);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Enter Scores
        </h1>
        <p className="mt-1 text-sm text-slate-500">{currentTerm.name} — you can only enter scores for subjects you teach.</p>
      </div>

      <form method="get" className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-900/5">
        <select
          name="pair"
          defaultValue={`${selectedClassId}_${selectedSubjectId}`}
          className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm"
        >
          {assignments.map((a) => (
            <option key={`${a.class_id}-${a.subject_id}`} value={`${a.class_id}_${a.subject_id}`}>
              {classNameById.get(a.class_id)} — {subjectNameById.get(a.subject_id)}
            </option>
          ))}
        </select>
        <button className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">Go</button>
      </form>

      {!students || students.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No students in this class yet" description="Register students and assign them to this class first." />
      ) : (
        <ScoreEntryForm
          classId={selectedClassId}
          subjectId={selectedSubjectId}
          termId={currentTerm.id}
          students={students}
          components={components ?? []}
          existing={existingScores ?? []}
        />
      )}
    </div>
  );
}
