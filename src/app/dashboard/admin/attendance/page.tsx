import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarCheck } from "lucide-react";

export default async function AttendanceOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const selectedDate = date || today;

  const supabase = await createClient();

  const [{ data: classes }, { data: records }] = await Promise.all([
    supabase.from("classes").select("id, name").order("order_index"),
    supabase.from("attendance_records").select("class_id, status").eq("date", selectedDate),
  ]);

  const byClass = new Map<string, Record<string, number>>();
  for (const r of records ?? []) {
    const bucket = byClass.get(r.class_id) ?? { present: 0, absent: 0, late: 0, excused: 0 };
    bucket[r.status] = (bucket[r.status] ?? 0) + 1;
    byClass.set(r.class_id, bucket);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Attendance Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">School-wide attendance for the selected day.</p>
      </div>

      <form method="get" className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-900/5">
        <input type="date" name="date" defaultValue={selectedDate} max={today} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm" />
        <button className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">View</button>
      </form>

      {!records || records.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No attendance recorded for this day" description="Teachers mark attendance from their own dashboard." />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5">
          <table className="w-full text-sm">
            <thead className="bg-navy-50/60 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Class</th>
                <th className="px-3 py-3 text-center">Present</th>
                <th className="px-3 py-3 text-center">Absent</th>
                <th className="px-3 py-3 text-center">Late</th>
                <th className="px-3 py-3 text-center">Excused</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5">
              {(classes ?? [])
                .filter((c) => byClass.has(c.id))
                .map((c) => {
                  const counts = byClass.get(c.id)!;
                  return (
                    <tr key={c.id}>
                      <td className="px-5 py-3 font-medium text-navy-900">{c.name}</td>
                      <td className="px-3 py-3 text-center text-emerald-700">{counts.present ?? 0}</td>
                      <td className="px-3 py-3 text-center text-crimson-600">{counts.absent ?? 0}</td>
                      <td className="px-3 py-3 text-center text-amber-700">{counts.late ?? 0}</td>
                      <td className="px-3 py-3 text-center text-slate-500">{counts.excused ?? 0}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
