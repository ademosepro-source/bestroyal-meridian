import Link from "next/link";
import { CalendarCheck, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard, ComingSoonPanel } from "@/components/dashboard/stat-card";
import { getCurrentProfile } from "@/lib/auth/get-current-user";

export default async function TeacherDashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { count: assignedClassCount } = await supabase
    .from("teacher_class_assignments")
    .select("*", { count: "exact", head: true })
    .eq("teacher_id", profile?.id ?? "");

  const today = new Date().toISOString().slice(0, 10);
  const { count: markedToday } = await supabase
    .from("attendance_records")
    .select("*", { count: "exact", head: true })
    .eq("recorded_by", profile?.id ?? "")
    .eq("date", today);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Teacher Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          You can only see classes and students assigned to you.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Users} label="Assigned Classes" value={assignedClassCount ?? 0} />
        <StatCard icon={CalendarCheck} label="Attendance Marked Today" value={markedToday ?? 0} />
        <ComingSoonPanel title="Pending Assessments" description="Arrives with the Examination module." />
      </div>

      <Link
        href="/dashboard/teacher/attendance"
        className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-gold-400"
      >
        <CalendarCheck className="h-4 w-4" /> Mark Today&apos;s Attendance
      </Link>
    </div>
  );
}
