import { createClient } from "@/lib/supabase/server";
import { createEvent, deleteEvent } from "@/app/dashboard/admin/events/actions";

const inputClass = "mt-1.5 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm outline-none focus:border-navy-500";
const labelClass = "block text-xs font-medium text-navy-700";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase.from("events").select("*").order("start_date", { ascending: true });

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          School Calendar
        </h1>
        <p className="mt-1 text-sm text-slate-500">Resumption dates, exams, breaks, holidays and events — shown on the public website.</p>
      </div>

      <form action={createEvent} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
        <div>
          <label className={labelClass} htmlFor="title">Title</label>
          <input id="title" name="title" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="description">Description (optional)</label>
          <textarea id="description" name="description" rows={2} className={inputClass} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass} htmlFor="start_date">Start Date</label>
            <input id="start_date" name="start_date" type="date" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="end_date">End Date (optional)</label>
            <input id="end_date" name="end_date" type="date" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="location">Location (optional)</label>
            <input id="location" name="location" className={inputClass} />
          </div>
        </div>
        <button type="submit" className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-navy-950 hover:bg-gold-400">
          Add Event
        </button>
      </form>

      <div className="space-y-3">
        {(events ?? []).map((e) => (
          <div key={e.id} className="flex items-start justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-900/5">
            <div>
              <p className="font-semibold text-navy-900">{e.title}</p>
              {e.description && <p className="mt-1 text-sm text-slate-600">{e.description}</p>}
              <p className="mt-2 text-xs text-slate-400">
                {e.start_date}{e.end_date && ` – ${e.end_date}`}{e.location && ` · ${e.location}`}
              </p>
            </div>
            <form action={deleteEvent.bind(null, e.id)}>
              <button className="text-xs text-crimson-600 hover:underline">Delete</button>
            </form>
          </div>
        ))}
        {(!events || events.length === 0) && <p className="text-sm text-slate-400">No events added yet.</p>}
      </div>
    </div>
  );
}
