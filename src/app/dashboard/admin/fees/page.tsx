import { createClient } from "@/lib/supabase/server";
import {
  createFeeCategory,
  createFeeStructure,
  deleteFeeCategory,
  deleteFeeStructure,
} from "@/app/dashboard/admin/fees/actions";

const inputClass = "mt-1.5 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm outline-none focus:border-navy-500";
const cardClass = "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5";
const submitClass = "mt-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800";

export default async function FeesConfigPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: classes }, { data: terms }, { data: structures }] = await Promise.all([
    supabase.from("fee_categories").select("*").order("name"),
    supabase.from("classes").select("id, name").order("order_index"),
    supabase.from("terms").select("id, name, is_current").order("start_date", { ascending: false }),
    supabase.from("fee_structures").select("*"),
  ]);

  const classNameById = new Map((classes ?? []).map((c) => [c.id, c.name]));
  const termNameById = new Map((terms ?? []).map((t) => [t.id, t.name]));
  const categoryNameById = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const currentTerm = (terms ?? []).find((t) => t.is_current);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Fee Configuration
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Set what each class is charged, per term, per fee category. Invoices are generated from this.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cardClass}>
          <h2 className="font-semibold text-navy-900">Fee Categories</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {(categories ?? []).map((c) => (
              <li key={c.id} className="flex items-center gap-2 rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-700">
                {c.name}
                <form action={deleteFeeCategory.bind(null, c.id)}>
                  <button className="text-crimson-600 hover:underline">×</button>
                </form>
              </li>
            ))}
          </ul>
          <form action={createFeeCategory} className="mt-4 grid grid-cols-2 gap-3 border-t border-navy-900/5 pt-4">
            <input name="name" required placeholder="Category name" className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm" />
            <input name="description" placeholder="Description (optional)" className={inputClass} />
            <button type="submit" className={`${submitClass} col-span-2`}>Add Category</button>
          </form>
        </div>

        <div className={cardClass}>
          <h2 className="font-semibold text-navy-900">Fee Structure</h2>
          <p className="mt-1 text-xs text-slate-500">
            Current term: {currentTerm?.name ?? "none set"}
          </p>
          <ul className="mt-3 max-h-64 divide-y divide-navy-900/5 overflow-y-auto text-sm">
            {(structures ?? []).map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2">
                <span>
                  {classNameById.get(s.class_id)} · {termNameById.get(s.term_id)} · {categoryNameById.get(s.fee_category_id)}
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-semibold text-navy-900">₦{Number(s.amount).toLocaleString()}</span>
                  <form action={deleteFeeStructure.bind(null, s.id)}>
                    <button className="text-xs text-crimson-600 hover:underline">Remove</button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
          <form action={createFeeStructure} className="mt-4 grid grid-cols-2 gap-3 border-t border-navy-900/5 pt-4">
            <select name="class_id" required className={inputClass}>
              <option value="">Select class</option>
              {(classes ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select name="term_id" required defaultValue={currentTerm?.id} className={inputClass}>
              <option value="">Select term</option>
              {(terms ?? []).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <select name="fee_category_id" required className={inputClass}>
              <option value="">Select category</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input name="amount" type="number" min={0} step="0.01" required placeholder="Amount (₦)" className={inputClass} />
            <button type="submit" className={`${submitClass} col-span-2`}>Set Amount</button>
          </form>
        </div>
      </div>
    </div>
  );
}
