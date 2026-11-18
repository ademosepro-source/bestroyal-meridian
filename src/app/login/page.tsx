"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-navy-950 px-6 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/images/brand/school-logo.png"
            alt="BestRoyal Meridian Nursery & Primary School crest"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
          />
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold text-navy-900">
            Portal Sign In
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            BestRoyal Meridian Nursery &amp; Primary School
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy-800">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1.5 w-full rounded-lg border border-navy-900/15 px-4 py-2.5 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-navy-800">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-lg border border-navy-900/15 px-4 py-2.5 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
            />
          </div>

          {state.error && (
            <p className="rounded-lg bg-crimson-500/10 px-4 py-2.5 text-sm text-crimson-600">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Don&apos;t have an account yet? Staff and parent accounts are created
          by school management.{" "}
          <Link href="/" className="font-medium text-navy-700 underline underline-offset-4">
            Back to website
          </Link>
        </p>
      </div>
    </main>
  );
}
