import { createClient } from "@/lib/supabase/server";
import { createAnnouncement, deleteAnnouncement } from "@/app/dashboard/admin/announcements/actions";

const inputClass = "mt-1.5 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm outline-none focus:border-navy-500";
const labelClass = "block text-xs font-medium text-navy-700";

export default async function AnnouncementsPage() {
  const supabase = await createClient();

  const [{ data: announcements }, { data: classes }] = await Promise.all([
    supabase.from("announcements").select("*").order("published_at", { ascending: false }),
    supabase.from("classes").select("id, name").order("order_index"),
  ]);

  const classNameById = new Map((classes ?? []).map((c) => [c.id, c.name]));

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Announcements
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          &ldquo;Public&rdquo; announcements show on the website; others notify only the audience chosen.
        </p>
      </div>

      <form action={createAnnouncement} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
        <div>
          <label className={labelClass} htmlFor="title">Title</label>
          <input id="title" name="title" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="body">Message</label>
          <textarea id="body" name="body" rows={3} required className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="audience">Audience</label>
            <select id="audience" name="audience" required defaultValue="public" className={inputClass}>
              <option value="public">Public (website)</option>
              <option value="parents">All Parents</option>
              <option value="staff">All Staff</option>
              <option value="class">One Class</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="class_id">Class (if audience is &ldquo;One Class&rdquo;)</label>
            <select id="class_id" name="class_id" className={inputClass}>
              <option value="">—</option>
              {(classes ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-navy-950 hover:bg-gold-400">
          Publish Announcement
        </button>
      </form>

      <div className="space-y-3">
        {(announcements ?? []).map((a) => (
          <div key={a.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-900/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy-900">{a.title}</p>
                <p className="mt-1 text-sm text-slate-600">{a.body}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(a.published_at).toLocaleString()} · {a.audience === "class" ? classNameById.get(a.class_id ?? "") : a.audience}
                </p>
              </div>
              <form action={deleteAnnouncement.bind(null, a.id)}>
                <button className="text-xs text-crimson-600 hover:underline">Delete</button>
              </form>
            </div>
          </div>
        ))}
        {(!announcements || announcements.length === 0) && (
          <p className="text-sm text-slate-400">No announcements published yet.</p>
        )}
      </div>
    </div>
  );
}
