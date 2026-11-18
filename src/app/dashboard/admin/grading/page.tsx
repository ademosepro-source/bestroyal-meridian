import { createClient } from "@/lib/supabase/server";
import {
  createAssessmentComponent,
  createGradeBand,
  deleteAssessmentComponent,
  deleteGradeBand,
} from "@/app/dashboard/admin/grading/actions";

const inputClass = "mt-1.5 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm outline-none focus:border-navy-500";
const labelClass = "block text-xs font-medium text-navy-700";
const cardClass = "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5";
const submitClass = "mt-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800";

export default async function GradingPage() {
  const supabase = await createClient();

  const [{ data: bands }, { data: components }] = await Promise.all([
    supabase.from("grade_bands").select("*").order("max_score", { ascending: false }),
    supabase.from("assessment_components").select("*").order("order_index"),
  ]);

  const componentTotal = (components ?? []).reduce((sum, c) => sum + Number(c.max_score), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Grading Configuration
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          These settings control how every subject score, grade and report card is calculated —
          change them here, never in code.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cardClass}>
          <h2 className="font-semibold text-navy-900">Assessment Components</h2>
          <p className="mt-1 text-xs text-slate-500">
            Should add up to 100.{" "}
            <span className={componentTotal === 100 ? "text-emerald-600" : "text-crimson-600"}>
              Current total: {componentTotal}
            </span>
          </p>
          <ul className="mt-3 divide-y divide-navy-900/5 text-sm">
            {(components ?? []).map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2">
                <span>{c.name}</span>
                <span className="flex items-center gap-3">
                  <span className="text-slate-500">/ {c.max_score}</span>
                  <form action={deleteAssessmentComponent.bind(null, c.id)}>
                    <button className="text-xs text-crimson-600 hover:underline">Remove</button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
          <form action={createAssessmentComponent} className="mt-4 grid grid-cols-3 gap-3 border-t border-navy-900/5 pt-4">
            <input name="name" required placeholder="1st CA" className="col-span-1 rounded-lg border border-navy-900/15 px-3 py-2 text-sm" />
            <div>
              <label className={labelClass}>Max Score</label>
              <input name="max_score" type="number" min={1} max={100} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Order</label>
              <input name="order_index" type="number" min={1} required defaultValue={(components?.length ?? 0) + 1} className={inputClass} />
            </div>
            <button type="submit" className={`${submitClass} col-span-3`}>Add Component</button>
          </form>
        </div>

        <div className={cardClass}>
          <h2 className="font-semibold text-navy-900">Grade Bands</h2>
          <ul className="mt-3 divide-y divide-navy-900/5 text-sm">
            {(bands ?? []).map((b) => (
              <li key={b.id} className="flex items-center justify-between py-2">
                <span className="font-semibold text-navy-900">{b.grade}</span>
                <span className="text-slate-500">{b.min_score}–{b.max_score}</span>
                <span className="text-slate-500">{b.remark}</span>
                <form action={deleteGradeBand.bind(null, b.id)}>
                  <button className="text-xs text-crimson-600 hover:underline">Remove</button>
                </form>
              </li>
            ))}
          </ul>
          <form action={createGradeBand} className="mt-4 grid grid-cols-4 gap-3 border-t border-navy-900/5 pt-4">
            <input name="grade" required placeholder="A" className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm" />
            <input name="min_score" type="number" min={0} max={100} required placeholder="Min" className={inputClass} />
            <input name="max_score" type="number" min={0} max={100} required placeholder="Max" className={inputClass} />
            <input name="remark" required placeholder="Excellent" className={inputClass} />
            <button type="submit" className={`${submitClass} col-span-4`}>Add Grade Band</button>
          </form>
        </div>
      </div>
    </div>
  );
}
