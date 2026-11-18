"use client";

import { useActionState } from "react";
import { submitApplication, type FormState } from "@/app/admissions/actions";
import type { Database } from "@/types/database";

type ClassRow = Database["public"]["Tables"]["classes"]["Row"];

const inputClass =
  "mt-1.5 w-full rounded-lg border border-navy-900/15 px-3.5 py-2.5 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20";
const labelClass = "block text-sm font-medium text-navy-800";

const initialState: FormState = { error: null, success: false };

export function ApplicationForm({ classes }: { classes: ClassRow[] }) {
  const [state, formAction, pending] = useActionState(submitApplication, initialState);

  if (state.success) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-navy-900/5">
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-navy-900">
          Application Submitted
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Thank you for applying to BestRoyal Meridian. Our admissions team will review your
          application and contact you using the details you provided.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-navy-900/5">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-navy-900">
          Child&apos;s Details
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="applicant_first_name">First Name</label>
            <input id="applicant_first_name" name="applicant_first_name" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="applicant_middle_name">Middle Name</label>
            <input id="applicant_middle_name" name="applicant_middle_name" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="applicant_surname">Surname</label>
            <input id="applicant_surname" name="applicant_surname" required className={inputClass} />
          </div>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="date_of_birth">Date of Birth</label>
            <input id="date_of_birth" name="date_of_birth" type="date" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="gender">Gender</label>
            <select id="gender" name="gender" required defaultValue="" className={inputClass}>
              <option value="" disabled>Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="desired_class_id">Desired Class</label>
            <select id="desired_class_id" name="desired_class_id" defaultValue="" className={inputClass}>
              <option value="">Not sure</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-5">
          <label className={labelClass} htmlFor="previous_school">Previous School (if any)</label>
          <input id="previous_school" name="previous_school" className={inputClass} />
        </div>
      </div>

      <div>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-navy-900">
          Parent / Guardian Details
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="parent_full_name">Full Name</label>
            <input id="parent_full_name" name="parent_full_name" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="parent_relationship">Relationship to Child</label>
            <select id="parent_relationship" name="parent_relationship" required defaultValue="mother" className={inputClass}>
              <option value="mother">Mother</option>
              <option value="father">Father</option>
              <option value="guardian">Guardian</option>
            </select>
          </div>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="parent_phone">Phone Number</label>
            <input id="parent_phone" name="parent_phone" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="parent_email">Email Address</label>
            <input id="parent_email" name="parent_email" type="email" required className={inputClass} />
          </div>
        </div>
        <div className="mt-5">
          <label className={labelClass} htmlFor="home_address">Home Address</label>
          <textarea id="home_address" name="home_address" rows={2} className={inputClass} />
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg bg-crimson-500/10 px-4 py-2.5 text-sm text-crimson-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit Application"}
      </button>
    </form>
  );
}
