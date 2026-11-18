"use client";

import { useActionState, useState } from "react";
import { createStaffAccount, type FormState } from "@/app/dashboard/admin/staff/actions";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-navy-900/15 px-3.5 py-2.5 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20";
const labelClass = "block text-sm font-medium text-navy-800";

const initialState: FormState = { error: null };

export default function NewStaffPage() {
  const [state, formAction, pending] = useActionState(createStaffAccount, initialState);
  const [copied, setCopied] = useState(false);

  if (state.password) {
    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
            Account Created
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Share this temporary password with the staff member yourself — no email was sent (no
            email provider is configured yet). They&apos;ll be required to set their own password
            the first time they sign in.
          </p>
        </div>

        <div className="space-y-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-navy-900/5">
          <div>
            <p className={labelClass}>Email</p>
            <p className="mt-1 text-sm text-slate-700">{state.email}</p>
          </div>
          <div>
            <p className={labelClass}>Temporary Password</p>
            <div className="mt-1.5 flex items-center gap-3">
              <code className="rounded-lg bg-navy-50 px-3.5 py-2.5 text-sm font-semibold tracking-wide text-navy-900">
                {state.password}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(state.password ?? "");
                  setCopied(true);
                }}
                className="rounded-full border border-navy-900/15 px-4 py-2 text-xs font-semibold text-navy-800 hover:bg-navy-50"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <a
            href="/dashboard/admin/staff"
            className="inline-flex rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 hover:bg-gold-400"
          >
            Back to Staff List
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Add Staff Member
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          A password is generated automatically and shown to you to share with them — they&apos;ll
          be required to change it the first time they sign in. A staff number is generated
          automatically too.
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
