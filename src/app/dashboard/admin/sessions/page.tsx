import { createClient } from "@/lib/supabase/server";
import { createSession, createTerm, setCurrentSession, setCurrentTerm } from "@/app/dashboard/admin/sessions/actions";

const inputClass = "mt-1.5 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm outline-none focus:border-navy-500";
const labelClass = "block text-xs font-medium text-navy-700";
const cardClass = "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5";
const submitClass = "mt-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800";

export default async function SessionsPage() {
  const supabase = await createClient();

  const [{ data: sessions }, { data: terms }] = await Promise.all([
    supabase.from("academic_sessions").select("*").order("start_date", { ascending: false }),
    supabase.from("terms").select("*").order("start_date", { ascending: false }),
  ]);

  const sessionNameById = new Map((sessions ?? []).map((s) => [s.id, s.name]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Academic Sessions & Terms
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Only one session and one term can be &ldquo;current&rdquo; at a time — that is what the rest of the
          system (attendance, results) will use by default.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cardClass}>
          <h2 className="font-semibold text-navy-900">Sessions</h2>
          <ul className="mt-3 divide-y divide-navy-900/5 text-sm">
            {(sessions ?? []).map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2">
                <span>
                  {s.name}{" "}
                  {s.is_current && (
                    <span className="ml-2 rounded-full bg-gold-100 px-2 py-0.5 text-xs font-medium text-gold-700">
                      Current
                    </span>
                  )}
                </span>
                {!s.is_current && (
                  <form action={setCurrentSession.bind(null, s.id)}>
                    <button className="text-xs font-semibold text-navy-700 hover:text-navy-900">Set current</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
          <form action={createSession} className="mt-4 grid grid-cols-3 gap-3 border-t border-navy-900/5 pt-4">
            <input name="name" required placeholder="2026/2027" className="col-span-3 rounded-lg border border-navy-900/15 px-3 py-2 text-sm" />
            <div>
              <label className={labelClass}>Start</label>
              <input name="start_date" type="date" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End</label>
              <input name="end_date" type="date" required className={inputClass} />
            </div>
            <button type="submit" className={`${submitClass} col-span-1 self-end`}>Add</button>
          </form>
        </div>

        <div className={cardClass}>
          <h2 className="font-semibold text-navy-900">Terms</h2>
          <ul className="mt-3 divide-y divide-navy-900/5 text-sm">
            {(terms ?? []).map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2">
                <span>
                  {sessionNameById.get(t.session_id)} – {t.name}{" "}
                  {t.is_current && (
                    <span className="ml-2 rounded-full bg-gold-100 px-2 py-0.5 text-xs font-medium text-gold-700">
                      Current
                    </span>
                  )}
                </span>
                {!t.is_current && (
                  <form action={setCurrentTerm.bind(null, t.id)}>
                    <button className="text-xs font-semibold text-navy-700 hover:text-navy-900">Set current</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
          <form action={createTerm} className="mt-4 grid grid-cols-2 gap-3 border-t border-navy-900/5 pt-4">
            <select name="session_id" required className="col-span-2 rounded-lg border border-navy-900/15 px-3 py-2 text-sm">
              <option value="">Select session</option>
              {(sessions ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input name="name" required placeholder="First Term" className="col-span-2 rounded-lg border border-navy-900/15 px-3 py-2 text-sm" />
            <div>
              <label className={labelClass}>Start</label>
              <input name="start_date" type="date" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End</label>
              <input name="end_date" type="date" required className={inputClass} />
            </div>
            <button type="submit" className={`${submitClass} col-span-2`}>Add Term</button>
          </form>
        </div>
      </div>
    </div>
  );
}
