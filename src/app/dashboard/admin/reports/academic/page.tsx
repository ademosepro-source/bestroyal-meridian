import { createClient } from "@/lib/supabase/server";
import { CsvExportButton } from "@/components/dashboard/csv-export-button";
import { PrintButton } from "@/components/dashboard/print-button";
import { EmptyState } from "@/components/ui/empty-state";
import { GraduationCap } from "lucide-react";
import { getClassTermSummaries } from "@/lib/academics/report-card-data";
import { average, ordinal } from "@/lib/academics/grading";

export default async function AcademicPerformanceReportPage({
  searchParams,
}: {
  searchParams: Promise<{ class_id?: string; term_id?: string }>;
}) {
  const { class_id, term_id } = await searchParams;
  const supabase = await createClient();

  const [{ data: classes }, { data: terms }] = await Promise.all([
    supabase.from("classes").select("id, name").order("order_index"),
    supabase.from("terms").select("id, name, is_current").order("start_date", { ascending: false }),
  ]);

  const currentTerm = (terms ?? []).find((t) => t.is_current);
  const selectedClassId = class_id || classes?.[0]?.id;
  const selectedTermId = term_id || currentTerm?.id;

  let students: { id: string; first_name: string; surname: string }[] = [];
  let summaries: Awaited<ReturnType<typeof getClassTermSummaries>> = new Map();

  if (selectedClassId && selectedTermId) {
    const { data } = await supabase
      .from("students")
      .select("id, first_name, surname")
      .eq("class_id", selectedClassId)
      .eq("status", "active")
      .order("surname");
    students = data ?? [];
    summaries = await getClassTermSummaries(supabase, selectedClassId, selectedTermId);
  }

  const classAverage = average([...summaries.values()].filter((s) => s.subjects.length > 0).map((s) => s.overallAverage));

  const rows = students.map((s) => {
    const summary = summaries.get(s.id);
    return {
      Student: `${s.first_name} ${s.surname}`,
      "Overall Average": summary ? summary.overallAverage.toFixed(1) : "",
      Position: summary?.position ? ordinal(summary.position) : "",
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
            Academic Performance
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Class average: <span className="font-semibold text-navy-900">{classAverage ? classAverage.toFixed(1) : "—"}</span>
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <CsvExportButton rows={rows} filename="academic-performance" />
          <PrintButton />
        </div>
      </div>

      <form method="get" className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-900/5 print:hidden">
        <select name="class_id" defaultValue={selectedClassId} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm">
          {(classes ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select name="term_id" defaultValue={selectedTermId} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm">
          {(terms ?? []).map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">View</button>
      </form>

      {students.length === 0 || [...summaries.values()].every((s) => s.subjects.length === 0) ? (
        <EmptyState icon={GraduationCap} title="No scores recorded" description="Nothing entered yet for this class and term." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5 print:shadow-none print:ring-0">
          <table className="w-full text-sm">
            <thead className="bg-navy-50/60 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3 text-center">Overall Average</th>
                <th className="px-4 py-3 text-center">Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5">
              {students
                .map((s) => ({ s, summary: summaries.get(s.id) }))
                .sort((a, b) => (b.summary?.overallAverage ?? 0) - (a.summary?.overallAverage ?? 0))
                .map(({ s, summary }) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2.5 font-medium text-navy-900">{s.first_name} {s.surname}</td>
                    <td className="px-4 py-2.5 text-center">{summary && summary.subjects.length > 0 ? summary.overallAverage.toFixed(1) : "—"}</td>
                    <td className="px-4 py-2.5 text-center">{summary?.position ? ordinal(summary.position) : "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
