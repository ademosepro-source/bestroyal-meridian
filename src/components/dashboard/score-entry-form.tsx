"use client";

import { useActionState } from "react";
import { submitScores, type FormState } from "@/app/dashboard/teacher/scores/actions";

type Student = { id: string; first_name: string; surname: string };
type Component = { id: string; name: string; max_score: number };
type ExistingScore = { student_id: string; component_id: string; score: number };

const initialState: FormState = { error: null, success: false };

export function ScoreEntryForm({
  classId,
  subjectId,
  termId,
  students,
  components,
  existing,
}: {
  classId: string;
  subjectId: string;
  termId: string;
  students: Student[];
  components: Component[];
  existing: ExistingScore[];
}) {
  const [state, formAction, pending] = useActionState(submitScores, initialState);

  const scoreFor = (studentId: string, componentId: string) =>
    existing.find((e) => e.student_id === studentId && e.component_id === componentId)?.score ?? "";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="class_id" value={classId} />
      <input type="hidden" name="subject_id" value={subjectId} />
      <input type="hidden" name="term_id" value={termId} />
      {components.map((c) => (
        <input key={c.id} type="hidden" name="component_id" value={c.id} />
      ))}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5">
        <table className="w-full text-sm">
          <thead className="bg-navy-50/60 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3">Student</th>
              {components.map((c) => (
                <th key={c.id} className="px-3 py-3 text-center">
                  {c.name} <span className="text-slate-400">/{c.max_score}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-900/5">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-5 py-3 font-medium text-navy-900">
                  <input type="hidden" name="student_id" value={student.id} />
                  {student.first_name} {student.surname}
                </td>
                {components.map((c) => (
                  <td key={c.id} className="px-3 py-3 text-center">
                    <input
                      type="number"
                      min={0}
                      max={c.max_score}
                      step="0.5"
                      name={`score_${student.id}_${c.id}`}
                      defaultValue={scoreFor(student.id, c.id)}
                      className="w-16 rounded-lg border border-navy-900/15 px-2 py-1.5 text-center text-sm outline-none focus:border-navy-500"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {state.error && (
        <p className="rounded-lg bg-crimson-500/10 px-4 py-2.5 text-sm text-crimson-600">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">Scores saved.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Scores"}
      </button>
    </form>
  );
}
