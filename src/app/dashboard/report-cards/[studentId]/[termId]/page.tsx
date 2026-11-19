import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-user";
import { getClassTermSummaries } from "@/lib/academics/report-card-data";
import { gradeForScore } from "@/lib/academics/grading";
import { CHARACTER_TRAITS, PSYCHOMOTOR_SKILLS, RATING_SCALE, ratingLabel } from "@/lib/academics/skills";
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

  const [
    { data: student },
    { data: classRow },
    { data: term },
    { data: bands },
    { data: components },
    { data: allTerms },
    settingsResult,
  ] = await Promise.all([
    supabase.from("students").select("*").eq("id", studentId).single(),
    supabase.from("classes").select("name").eq("id", reportCard.class_id).single(),
    supabase.from("terms").select("name, session_id, start_date, end_date").eq("id", termId).single(),
    supabase.from("grade_bands").select("*"),
    supabase.from("assessment_components").select("*").order("order_index"),
    supabase.from("terms").select("id, name, start_date").order("start_date"),
    supabase.from("school_settings").select("*").maybeSingle(),
  ]);

  const [{ data: session }, { data: classArm }] = await Promise.all([
    supabase.from("academic_sessions").select("name").eq("id", term?.session_id ?? "").maybeSingle(),
    supabase.from("class_arms").select("name").eq("id", student?.class_arm_id ?? "").maybeSingle(),
  ]);

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
  const totalAttendanceDays = attendanceCounts.present + attendanceCounts.absent + attendanceCounts.late + attendanceCounts.excused;

  const settings = settingsResult.data;

  const nextTerm = (() => {
    if (!allTerms) return null;
    const index = allTerms.findIndex((t) => t.id === termId);
    return index >= 0 ? (allTerms[index + 1] ?? null) : null;
  })();

  const subjects = summary?.subjects ?? [];
  const componentList = components ?? [];

  const cumulativeByComponent = new Map<string, number>();
  for (const component of componentList) {
    const sum = subjects.reduce((acc, s) => {
      const match = s.componentScores.find((c) => c.componentId === component.id);
      return acc + (match?.score ?? 0);
    }, 0);
    cumulativeByComponent.set(component.id, sum);
  }
  const cumulativeTotal = subjects.reduce((acc, s) => acc + s.total, 0);

  const characterRatings = (reportCard.character_ratings ?? {}) as Record<string, number>;
  const psychomotorRatings = (reportCard.psychomotor_ratings ?? {}) as Record<string, number>;
  const hasSkillRatings = CHARACTER_TRAITS.some((t) => characterRatings[t.key]) || PSYCHOMOTOR_SKILLS.some((s) => psychomotorRatings[s.key]);

  return (
    <div className="mx-auto max-w-4xl print:max-w-none">
      <style>{"@page { size: A4; margin: 10mm; }"}</style>

      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="rounded-[28px] border-[3px] border-navy-900 bg-white p-2 shadow-sm ring-1 ring-navy-900/5 print:rounded-none print:border-2 print:p-0 print:shadow-none print:ring-0">
        <div className="rounded-3xl border border-gold-500/60 p-8 print:rounded-none print:border-0 print:p-3">
          {/* Letterhead */}
          <header className="flex items-center gap-5 border-b-2 border-gold-500 pb-5 print:gap-3 print:pb-2">
            <Image
              src="/images/brand/school-logo.png"
              alt="School crest"
              width={72}
              height={72}
              className="h-[72px] w-[72px] shrink-0 object-contain print:h-14 print:w-14"
            />
            <div className="min-w-0 flex-1 text-center">
              <p className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-wide text-navy-900 print:text-lg">
                {settings?.school_name ?? "BestRoyal Meridian Nursery & Primary School"}
              </p>
              {settings?.address && <p className="mt-0.5 text-[11px] text-slate-500">{settings.address}</p>}
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.3em] text-gold-700 print:text-[10px] print:tracking-[0.2em]">
                {settings?.motto ?? "Soaring for Excellence"}
              </p>
            </div>
            {student?.photo_url ? (
              <Image
                src={student.photo_url}
                alt="Student photo"
                width={72}
                height={72}
                className="h-[72px] w-[72px] shrink-0 rounded-lg border border-navy-900/15 object-cover print:h-14 print:w-14"
              />
            ) : (
              <div className="h-[72px] w-[72px] shrink-0 print:h-14 print:w-14" />
            )}
          </header>

          <p className="mt-4 rounded-full bg-navy-900 py-1.5 text-center text-xs font-bold uppercase tracking-[0.25em] text-white print:mt-2 print:py-1 print:text-[10px]">
            Pupil&apos;s Terminal Report — {term?.name}, {session?.name}
          </p>

          {/* Student info panel */}
          <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2 rounded-xl bg-navy-50/60 p-5 text-sm sm:grid-cols-3 print:mt-3 print:gap-x-4 print:gap-y-1 print:p-3 print:text-xs">
            <Field label="Full Name" value={`${student?.first_name} ${student?.surname}`} />
            <Field label="Admission No." value={student?.admission_number} />
            <Field label="Class" value={classRow?.name} />
            <Field label="Class Arm" value={classArm?.name ?? "—"} />
            <Field label="Sex" value={student?.gender === "male" ? "Male" : "Female"} />
            <Field label="No. in Class" value={summary?.classSize ?? "—"} />
            <Field label="Attendance" value={totalAttendanceDays > 0 ? `${attendanceCounts.present} / ${totalAttendanceDays}` : "—"} />
            <Field label="Next Term Resumes" value={nextTerm ? formatDate(nextTerm.start_date) : "To be announced"} />
          </div>

          {/* Subjects table */}
          <div className="mt-6 overflow-x-auto print:mt-3 print:overflow-visible">
            <table className="w-full min-w-[600px] border-collapse text-sm print:min-w-0 print:text-[11px]">
              <thead>
                <tr className="bg-navy-900 text-left text-[11px] uppercase tracking-wide text-white print:text-[9px]">
                  <th className="rounded-l-lg px-3 py-2 print:px-2 print:py-1">Subject</th>
                  {componentList.map((c) => (
                    <th key={c.id} className="px-2 py-2 text-center print:py-1">
                      {c.name}
                      <br />
                      <span className="font-normal normal-case text-white/70">(/{c.max_score})</span>
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center print:py-1">Total (/100)</th>
                  <th className="px-2 py-2 text-center print:py-1">Grade</th>
                  <th className="rounded-r-lg px-3 py-2 print:px-2 print:py-1">Remark</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s, i) => {
                  const { grade, remark } = gradeForScore(s.total, bands ?? []);
                  return (
                    <tr key={s.subjectId} className={i % 2 === 0 ? "bg-white" : "bg-navy-50/40"}>
                      <td className="px-3 py-2 font-medium text-navy-900 print:px-2 print:py-1">{s.subjectName}</td>
                      {componentList.map((c) => {
                        const match = s.componentScores.find((cs) => cs.componentId === c.id);
                        return (
                          <td key={c.id} className="px-2 py-2 text-center text-slate-600 print:py-1">
                            {match ? Number(match.score).toFixed(0) : "—"}
                          </td>
                        );
                      })}
                      <td className="px-2 py-2 text-center font-semibold text-navy-900 print:py-1">{s.total.toFixed(0)}</td>
                      <td className="px-2 py-2 text-center font-bold text-gold-700 print:py-1">{grade}</td>
                      <td className="px-3 py-2 text-slate-600 print:px-2 print:py-1">{remark}</td>
                    </tr>
                  );
                })}
                {subjects.length === 0 && (
                  <tr>
                    <td colSpan={componentList.length + 4} className="py-6 text-center text-slate-400">
                      No scores recorded for this term yet.
                    </td>
                  </tr>
                )}
                {subjects.length > 0 && (
                  <tr className="border-t-2 border-navy-900 bg-gold-500/10 font-semibold text-navy-900">
                    <td className="px-3 py-2 print:px-2 print:py-1">Cumulative</td>
                    {componentList.map((c) => (
                      <td key={c.id} className="px-2 py-2 text-center print:py-1">
                        {(cumulativeByComponent.get(c.id) ?? 0).toFixed(0)}
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center print:py-1">{cumulativeTotal.toFixed(0)}</td>
                    <td className="px-2 py-2 text-center print:py-1" colSpan={2}>
                      Avg: {summary ? summary.overallAverage.toFixed(1) : "—"}%
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Character development & psychomotor skills */}
          {hasSkillRatings && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 print:mt-3 print:gap-2">
              <SkillTable title="Character Development" items={CHARACTER_TRAITS} ratings={characterRatings} />
              <SkillTable title="Psychomotor Skills" items={PSYCHOMOTOR_SKILLS} ratings={psychomotorRatings} />
            </div>
          )}

          {hasSkillRatings && (
            <p className="mt-2 text-center text-[11px] text-slate-500 print:mt-1 print:text-[9px]">
              Key to Rating:{" "}
              {RATING_SCALE.map((r) => `${r.value} = ${r.label}`).join("  ·  ")}
            </p>
          )}

          {/* Comments */}
          <div className="mt-6 space-y-2.5 text-sm print:mt-3 print:space-y-1 print:text-xs">
            <Comment label="Class Teacher's Comment" value={reportCard.teacher_comment} />
            <Comment label="Head Teacher's Remark" value={reportCard.principal_comment} />
            <Comment label="Promotion Status" value={reportCard.promotion_status} />
          </div>

          {/* Signatures */}
          <div className="mt-12 grid grid-cols-2 gap-8 text-sm print:mt-6 print:gap-4 print:text-xs">
            <div className="border-t border-navy-900/30 pt-2 text-center text-slate-500">Class Teacher&apos;s Signature</div>
            <div className="border-t border-navy-900/30 pt-2 text-center text-slate-500">Head Teacher&apos;s Signature</div>
          </div>
        </div>
      </div>

      {reportCard.status !== "published" && (
        <p className="mt-6 text-center text-xs uppercase tracking-wider text-amber-600 print:hidden">
          Preview only — status: {reportCard.status}
        </p>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-slate-500 print:text-[9px]">{label}</dt>
      <dd className="font-semibold text-navy-900 print:text-xs">{value}</dd>
    </div>
  );
}

function Comment({ label, value }: { label: string; value: string | null }) {
  return (
    <p>
      <span className="font-semibold text-navy-900">{label}: </span>
      {value || "—"}
    </p>
  );
}

function SkillTable({
  title,
  items,
  ratings,
}: {
  title: string;
  items: readonly { key: string; label: string }[];
  ratings: Record<string, number>;
}) {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-navy-900/10">
      <p className="bg-navy-900 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white print:px-2 print:py-1 print:text-[10px]">
        {title}
      </p>
      <table className="w-full text-xs print:text-[10px]">
        <tbody>
          {items.map((item, i) => (
            <tr key={item.key} className={i % 2 === 0 ? "bg-white" : "bg-navy-50/40"}>
              <td className="px-3 py-1.5 text-slate-700 print:px-2 print:py-0.5">{item.label}</td>
              <td className="px-3 py-1.5 text-right font-semibold text-navy-900 print:px-2 print:py-0.5">
                {ratings[item.key] ? `${ratings[item.key]} — ${ratingLabel(ratings[item.key])}` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
