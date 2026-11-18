import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard, ComingSoonPanel } from "@/components/dashboard/stat-card";
import { GraduationCap, CalendarCheck } from "lucide-react";

export default async function PrincipalDashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ count: studentCount }, { count: attendanceToday }] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("attendance_records").select("*", { count: "exact", head: true }).eq("date", today),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Head Teacher / Principal Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Academic oversight. Financial and system administration stay with the Super Administrator.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={GraduationCap} label="Active Students" value={studentCount ?? 0} />
        <StatCard icon={CalendarCheck} label="Attendance Records Today" value={attendanceToday ?? 0} />
        <ComingSoonPanel title="Pending Results for Approval" description="Arrives with the results approval workflow." />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/admin/attendance" className="rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-gold-400">
          View Attendance Overview
        </Link>
        <Link href="/dashboard/admin/students" className="rounded-full border border-navy-900/15 px-5 py-2.5 text-sm font-semibold text-navy-800 hover:bg-navy-50">
          Student Records
        </Link>
      </div>
    </div>
  );
}
