import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-user";
import { getClassTermSummaries } from "@/lib/academics/report-card-data";
import { gradeForScore, ordinal } from "@/lib/academics/grading";
import { PrintButton } from "@/components/dashboard/print-button";

export default async function ReportCardPage({
  params,
}: {
  params: Promise<{ studentId: string; termId: string }>;
}) {
  const { studentId, termId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();

  const { data: reportCard } = await supabase
    .from("report_cards")
    .select("*")
    .eq("student_id", studentId)
    .eq("term_id", termId)
    .maybeSingle();

  if (!reportCard) notFound();

  // Access control beyond RLS: staff roles may preview any report card they
  // are entitled to manage; a parent only once it is published and linked
  // to their account (RLS enforces the same, this just gives a clear page).
  if (profile.role === "parent") {
    const { data: link } = await supabase
      .from("parent_student")
      .select("student_id")
      .eq("parent_id", profile.id)
      .eq("student_id", studentId)
      .maybeSingle();
    if (!link || reportCard.status !== "published") notFound();
  }

  const [{ data: student }, { data: classRow }, { data: term }, { data: bands }, settingsResult] = await Promise.all([
    supabase.from("students").select("*").eq("id", studentId).single(),
    supabase.from("classes").select("name").eq("id", reportCard.class_id).single(),
    supabase.from("terms").select("name, session_id").eq("id", termId).single(),
    supabase.from("grade_bands").select("*"),
    supabase.from("school_settings").select("*").maybeSingle(),
  ]);

  const { data: session } = term
    ? await supabase.from("academic_sessions").select("name").eq("id", term.session_id).maybeSingle()
    : { data: null };

  const summaries = await getClassTermSummaries(supabase, reportCard.class_id, termId);
  const summary = summaries.get(studentId);

  const { data: attendance } = await supabase
    .from("attendance_records")
    .select("status")
    .eq("student_id", studentId)
    .eq("term_id", termId);

  const attendanceCounts = { present: 0, absent: 0, late: 0, excused: 0 };
  for (const a of attendance ?? []) {
    attendanceCounts[a.status] = (attendanceCounts[a.status] ?? 0) + 1;
  }

  const settings = settingsResult.data;

  return (
    <div className="mx-auto max-w-3xl bg-white p-10 shadow-sm ring-1 ring-navy-900/5 print:shadow-none print:ring-0">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <header className="flex items-center gap-4 border-b-2 border-navy-900 pb-4">
        <Image
          src="/images/brand/school-logo.png"
          alt="School crest"
          width={64}
          height={64}
          className="h-16 w-16 object-contain"
        />
        <div>
          <p className="font-[family-name:var(--font-display)] text-xl font-bold text-navy-900">
            {settings?.school_name ?? "BestRoyal Meridian Nursery & Primary School"}
          </p>
          <p className="text-xs uppercase tracking-wider text-gold-700">{settings?.motto ?? "Soaring for Excellence"}</p>
        </div>
        {student?.photo_url && (
          <Image src={student.photo_url} alt="Student photo" width={64} height={64} className="ml-auto h-16 w-16 rounded object-cover" />
        )}
      </header>

      <h1 className="mt-4 text-center font-[family-name:var(--font-display)] text-lg font-semibold text-navy-900">
        Pupil&apos;s Report Card — {term?.name}, {session?.name}
      </h1>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div><dt className="inline text-slate-500">Name: </dt><dd className="inline font-medium text-navy-900">{student?.first_name} {student?.surname}</dd></div>
        <div><dt className="inline text-slate-500">Admission No.: </dt><dd className="inline font-medium text-navy-900">{student?.admission_number}</dd></div>
        <div><dt className="inline text-slate-500">Class: </dt><dd className="inline font-medium text-navy-900">{classRow?.name}</dd></div>
        <div>
          <dt className="inline text-slate-500">Position in Class: </dt>
          <dd className="inline font-medium text-navy-900">
            {summary?.position ? `${ordinal(summary.position)} of ${summary.classSize}` : "—"}
          </dd>
        </div>
      </dl>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-navy-900 text-left">
            <th className="py-2">Subject</th>
            <th className="py-2 text-center">Total (/100)</th>
            <th className="py-2 text-center">Grade</th>
            <th className="py-2">Remark</th>
          </tr>
        </thead>
        <tbody>
          {(summary?.subjects ?? []).map((s) => {
            const { grade, remark } = gradeForScore(s.total, bands ?? []);
            return (
              <tr key={s.subjectId} className="border-b border-navy-900/10">
                <td className="py-2">{s.subjectName}</td>
                <td className="py-2 text-center">{s.total.toFixed(1)}</td>
                <td className="py-2 text-center font-semibold">{grade}</td>
                <td className="py-2">{remark}</td>
              </tr>
            );
          })}
          {(!summary || summary.subjects.length === 0) && (
            <tr><td colSpan={4} className="py-4 text-center text-slate-400">No scores recorded for this term yet.</td></tr>
          )}
        </tbody>
      </table>

      <p className="mt-3 text-sm font-medium text-navy-900">
        Overall Average: {summary ? summary.overallAverage.toFixed(1) : "—"}
      </p>

      <div className="mt-6 grid grid-cols-4 gap-4 text-center text-xs">
        <div><p className="font-semibold text-navy-900">{attendanceCounts.present}</p><p className="text-slate-500">Present</p></div>
        <div><p className="font-semibold text-navy-900">{attendanceCounts.absent}</p><p className="text-slate-500">Absent</p></div>
        <div><p className="font-semibold text-navy-900">{attendanceCounts.late}</p><p className="text-slate-500">Late</p></div>
        <div><p className="font-semibold text-navy-900">{attendanceCounts.excused}</p><p className="text-slate-500">Excused</p></div>
      </div>

      <div className="mt-6 space-y-3 text-sm">
        <p><span className="font-semibold text-navy-900">Teacher&apos;s Comment: </span>{reportCard.teacher_comment || "—"}</p>
        <p><span className="font-semibold text-navy-900">Principal&apos;s Comment: </span>{reportCard.principal_comment || "—"}</p>
        <p><span className="font-semibold text-navy-900">Promotion Status: </span>{reportCard.promotion_status || "—"}</p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-8 text-sm">
        <div className="border-t border-navy-900/30 pt-2 text-center text-slate-500">Class Teacher&apos;s Signature</div>
        <div className="border-t border-navy-900/30 pt-2 text-center text-slate-500">Principal&apos;s Signature</div>
      </div>

      {reportCard.status !== "published" && (
        <p className="mt-6 text-center text-xs uppercase tracking-wider text-amber-600 print:hidden">
          Preview only — status: {reportCard.status}
        </p>
      )}
    </div>
  );
}
