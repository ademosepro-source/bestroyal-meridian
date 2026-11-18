"use client";

import { useActionState } from "react";
import { submitAttendance, type FormState } from "@/app/dashboard/teacher/attendance/actions";

type Student = { id: string; first_name: string; surname: string };
type ExistingRecord = { student_id: string; status: string; remarks: string | null };

const STATUSES = ["present", "absent", "late", "excused"] as const;
const initialState: FormState = { error: null, success: false };

export function AttendanceForm({
  classId,
  classArmId,
  date,
  students,
  existing,
}: {
  classId: string;
  classArmId: string | null;
  date: string;
  students: Student[];
  existing: Record<string, ExistingRecord>;
}) {
  const [state, formAction, pending] = useActionState(submitAttendance, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="class_id" value={classId} />
      <input type="hidden" name="class_arm_id" value={classArmId ?? ""} />
      <input type="hidden" name="date" value={date} />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5">
        <table className="w-full text-sm">
          <thead className="bg-navy-50/60 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3">Student</th>
              {STATUSES.map((s) => (
                <th key={s} className="px-3 py-3 text-center capitalize">{s}</th>
              ))}
              <th className="px-5 py-3">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-900/5">
            {students.map((student) => {
              const record = existing[student.id];
              return (
                <tr key={student.id}>
                  <td className="px-5 py-3 font-medium text-navy-900">
                    <input type="hidden" name="student_id" value={student.id} />
                    {student.first_name} {student.surname}
                  </td>
                  {STATUSES.map((s) => (
                    <td key={s} className="px-3 py-3 text-center">
                      <input
                        type="radio"
                        name={`status_${student.id}`}
                        value={s}
                        defaultChecked={record ? record.status === s : s === "present"}
                      />
                    </td>
                  ))}
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      name={`remarks_${student.id}`}
                      defaultValue={record?.remarks ?? ""}
                      className="w-full rounded-lg border border-navy-900/15 px-2.5 py-1.5 text-xs outline-none focus:border-navy-500"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {state.error && (
        <p className="rounded-lg bg-crimson-500/10 px-4 py-2.5 text-sm text-crimson-600">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">Attendance saved.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Attendance"}
      </button>
    </form>
  );
}
