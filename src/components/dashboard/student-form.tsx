"use client";

import { useActionState } from "react";
import type { Database } from "@/types/database";
import type { FormState } from "@/app/dashboard/admin/students/actions";

type ClassRow = Database["public"]["Tables"]["classes"]["Row"];
type ClassArmRow = Database["public"]["Tables"]["class_arms"]["Row"];
type SessionRow = Database["public"]["Tables"]["academic_sessions"]["Row"];
type StudentRow = Database["public"]["Tables"]["students"]["Row"];

const inputClass =
  "mt-1.5 w-full rounded-lg border border-navy-900/15 px-3.5 py-2.5 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20";
const labelClass = "block text-sm font-medium text-navy-800";

const initialState: FormState = { error: null };

export function StudentForm({
  action,
  classes,
  classArms,
  sessions,
  student,
  submitLabel = "Register Student",
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  classes: ClassRow[];
  classArms: ClassArmRow[];
  sessions: SessionRow[];
  student?: StudentRow;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="first_name">First Name</label>
          <input id="first_name" name="first_name" required defaultValue={student?.first_name} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="middle_name">Middle Name</label>
          <input id="middle_name" name="middle_name" defaultValue={student?.middle_name ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="surname">Surname</label>
          <input id="surname" name="surname" required defaultValue={student?.surname} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="date_of_birth">Date of Birth</label>
          <input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            required
            defaultValue={student?.date_of_birth}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="gender">Gender</label>
          <select id="gender" name="gender" required defaultValue={student?.gender ?? ""} className={inputClass}>
            <option value="" disabled>Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="class_id">Class</label>
          <select id="class_id" name="class_id" defaultValue={student?.class_id ?? ""} className={inputClass}>
            <option value="">Not assigned</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="class_arm_id">Class Arm</label>
          <select id="class_arm_id" name="class_arm_id" defaultValue={student?.class_arm_id ?? ""} className={inputClass}>
            <option value="">Not assigned</option>
            {classArms.map((a) => (
              <option key={a.id} value={a.id}>
                {(classes.find((c) => c.id === a.class_id)?.name ?? "")} – Arm {a.name}
              </option>
            ))}
          </select>
        </div>
        {!student && (
          <div>
            <label className={labelClass} htmlFor="admission_session_id">Admission Session</label>
            <select id="admission_session_id" name="admission_session_id" className={inputClass}>
              <option value="">Select session</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id} selected={s.is_current}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="previous_school">Previous School (if any)</label>
        <input id="previous_school" name="previous_school" defaultValue={student?.previous_school ?? ""} className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="home_address">Home Address</label>
        <textarea id="home_address" name="home_address" rows={2} defaultValue={student?.home_address ?? ""} className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="medical_notes">
          Medical / Allergy Notes <span className="font-normal text-slate-400">(restricted access)</span>
        </label>
        <textarea id="medical_notes" name="medical_notes" rows={2} defaultValue={student?.medical_notes ?? ""} className={inputClass} />
      </div>

      {state.error && (
        <p className="rounded-lg bg-crimson-500/10 px-4 py-2.5 text-sm text-crimson-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
