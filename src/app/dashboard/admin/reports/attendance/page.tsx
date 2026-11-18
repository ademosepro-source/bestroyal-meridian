import { createClient } from "@/lib/supabase/server";
import { CsvExportButton } from "@/components/dashboard/csv-export-button";
import { PrintButton } from "@/components/dashboard/print-button";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarCheck } from "lucide-react";

export default async function AttendanceReportPage({
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

  let rows: Record<string, string | number>[] = [];
  let studentRows: { name: string; admissionNo: string; present: number; absent: number; late: number; excused: number; total: number; pct: string }[] = [];

  if (selectedClassId && selectedTermId) {
    const { data: students } = await supabase
      .from("students")
      .select("id, first_name, surname, admission_number")
      .eq("class_id", selectedClassId)
      .eq("status", "active")
      .order("surname");

    const { data: records } = await supabase
      .from("attendance_records")
      .select("student_id, status")
      .eq("class_id", selectedClassId)
      .eq("term_id", selectedTermId);

    studentRows = (students ?? []).map((s) => {
      const studentRecords = (records ?? []).filter((r) => r.student_id === s.id);
      const present = studentRecords.filter((r) => r.status === "present").length;
      const absent = studentRecords.filter((r) => r.status === "absent").length;
      const late = studentRecords.filter((r) => r.status === "late").length;
      const excused = studentRecords.filter((r) => r.status === "excused").length;
      const total = studentRecords.length;
      const pct = total > 0 ? ((present / total) * 100).toFixed(1) : "—";
      return { name: `${s.first_name} ${s.surname}`, admissionNo: s.admission_number, present, absent, late, excused, total, pct };
    });

    rows = studentRows.map((s) => ({
      Student: s.name,
      "Admission No.": s.admissionNo,
      Present: s.present,
      Absent: s.absent,
      Late: s.late,
      Excused: s.excused,
      "Days Recorded": s.total,
      "Attendance %": s.pct,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
            Attendance Report
          </h1>
          <p className="mt-1 text-sm text-slate-500">Per-student attendance for a class and term.</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <CsvExportButton rows={rows} filename="attendance-report" />
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

      {studentRows.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No attendance data" description="Nothing recorded yet for this class and term." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5 print:shadow-none print:ring-0">
          <table className="w-full text-sm">
            <thead className="bg-navy-50/60 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3 text-center">Present</th>
                <th className="px-4 py-3 text-center">Absent</th>
                <th className="px-4 py-3 text-center">Late</th>
                <th className="px-4 py-3 text-center">Excused</th>
                <th className="px-4 py-3 text-center">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5">
              {studentRows.map((s) => (
                <tr key={s.admissionNo}>
                  <td className="px-4 py-2.5 font-medium text-navy-900">{s.name}</td>
                  <td className="px-4 py-2.5 text-center text-emerald-700">{s.present}</td>
                  <td className="px-4 py-2.5 text-center text-crimson-600">{s.absent}</td>
                  <td className="px-4 py-2.5 text-center text-amber-700">{s.late}</td>
                  <td className="px-4 py-2.5 text-center text-slate-500">{s.excused}</td>
                  <td className="px-4 py-2.5 text-center font-semibold">{s.pct}{s.pct !== "—" && "%"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
