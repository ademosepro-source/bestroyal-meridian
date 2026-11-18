"use client";

import { useActionState } from "react";
import { changePassword, type ChangePasswordState } from "@/app/dashboard/change-password/actions";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-navy-900/15 px-3.5 py-2.5 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20";
const labelClass = "block text-sm font-medium text-navy-800";

const initialState: ChangePasswordState = { error: null };

export default function ChangePasswordPage() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Set Your Own Password
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Your account was created with a temporary password. Choose a new password to continue.
        </p>
      </div>

      <form action={formAction} className="space-y-5 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-navy-900/5">
        <div>
          <label className={labelClass} htmlFor="password">New Password</label>
          <input id="password" name="password" type="password" required minLength={8} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="confirm_password">Confirm New Password</label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            required
            minLength={8}
            className={inputClass}
          />
        </div>

        {state.error && (
          <p className="rounded-lg bg-crimson-500/10 px-4 py-2.5 text-sm text-crimson-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Set Password"}
        </button>
      </form>
    </div>
  );
}
