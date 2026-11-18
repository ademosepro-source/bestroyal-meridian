"use client";

import { useActionState } from "react";
import { createStaffAccount, type FormState } from "@/app/dashboard/admin/staff/actions";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-navy-900/15 px-3.5 py-2.5 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20";
const labelClass = "block text-sm font-medium text-navy-800";

const initialState: FormState = { error: null };

export default function NewStaffPage() {
  const [state, formAction, pending] = useActionState(createStaffAccount, initialState);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Add Staff Member
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          They&apos;ll receive an email invite to set their own password. A staff number is
          generated automatically.
        </p>
      </div>

      <form action={formAction} className="space-y-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-navy-900/5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="full_name">Full Name</label>
            <input id="full_name" name="full_name" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email" required className={inputClass} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="phone">Phone (optional)</label>
            <input id="phone" name="phone" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="role">Role</label>
            <select id="role" name="role" required defaultValue="" className={inputClass}>
              <option value="" disabled>Select a role</option>
              <option value="principal">Head Teacher / Principal</option>
              <option value="teacher">Teacher</option>
              <option value="bursar">Accountant / Bursar</option>
              <option value="admissions_officer">Admissions Officer</option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="position">Position / Title</label>
            <input id="position" name="position" required placeholder="e.g. Primary 4 Class Teacher" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="department">Department (optional)</label>
            <input id="department" name="department" className={inputClass} />
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
          {pending ? "Creating…" : "Create Account"}
        </button>
      </form>
    </div>
  );
}
