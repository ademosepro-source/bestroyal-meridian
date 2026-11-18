import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-user";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarCheck } from "lucide-react";
import { AttendanceForm } from "@/components/dashboard/attendance-form";

export default async function TeacherAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ class_id?: string; class_arm_id?: string; date?: string }>;
}) {
  const { class_id, class_arm_id, date } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const selectedDate = date || today;

  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: assignments } = await supabase
    .from("teacher_class_assignments")
    .select("class_id, class_arm_id")
    .eq("teacher_id", profile?.id ?? "");

  if (!assignments || assignments.length === 0) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title="No class assigned yet"
        description="Ask school management to assign you to a class before you can take attendance."
      />
    );
  }

  const { data: assignedClasses } = await supabase
    .from("classes")
    .select("id, name")
    .in("id", assignments.map((a) => a.class_id));
  const classNameById = new Map((assignedClasses ?? []).map((c) => [c.id, c.name]));

  const selected = class_id
    ? assignments.find((a) => a.class_id === class_id)
    : assignments[0];

  const selectedClassId = selected?.class_id ?? assignments[0].class_id;
  const selectedArmId = class_arm_id || selected?.class_arm_id || null;

  const { data: students } = await supabase
    .from("students")
    .select("id, first_name, surname")
    .eq("class_id", selectedClassId)
    .eq("status", "active")
    .order("surname");

  const { data: existingRecords } = await supabase
    .from("attendance_records")
    .select("student_id, status, remarks")
    .eq("date", selectedDate)
    .in("student_id", (students ?? []).map((s) => s.id));

  const recordByStudent = new Map((existingRecords ?? []).map((r) => [r.student_id, r]));

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Mark Attendance
        </h1>
        <p className="mt-1 text-sm text-slate-500">You can only take attendance for classes assigned to you.</p>
      </div>

      <form method="get" className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-900/5">
        <select name="class_id" defaultValue={selectedClassId} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm">
          {assignments.map((a) => (
            <option key={`${a.class_id}-${a.class_arm_id ?? "all"}`} value={a.class_id}>
              {classNameById.get(a.class_id)}
            </option>
          ))}
        </select>
        <input type="date" name="date" defaultValue={selectedDate} max={today} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm" />
        <button className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">Go</button>
      </form>

      {!students || students.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No students in this class yet" description="Register students and assign them to this class first." />
      ) : (
        <AttendanceForm
          classId={selectedClassId}
          classArmId={selectedArmId}
          date={selectedDate}
          students={students}
          existing={Object.fromEntries(recordByStudent)}
        />
      )}
    </div>
  );
}
