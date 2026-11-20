import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard, ComingSoonPanel } from "@/components/dashboard/stat-card";
import { Banknote, CalendarCheck, FileText, GraduationCap } from "lucide-react";
import { formatNaira } from "@/lib/finance/invoices";

export default async function PrincipalDashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [{ count: studentCount }, { count: attendanceToday }, { count: pendingApplications }, { data: monthPayments }] =
    await Promise.all([
      supabase.from("students").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("attendance_records").select("*", { count: "exact", head: true }).eq("date", today),
      supabase
        .from("admission_applications")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "under_review"]),
      supabase.from("payments").select("amount").eq("status", "successful").gte("paid_at", monthStart),
    ]);

  const feesCollectedThisMonth = (monthPayments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Head Teacher / Principal Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Academic oversight, admissions and school finances. Staff accounts stay with the Super Administrator.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={GraduationCap} label="Active Students" value={studentCount ?? 0} />
        <StatCard icon={CalendarCheck} label="Attendance Records Today" value={attendanceToday ?? 0} />
        <StatCard icon={FileText} label="Pending Applications" value={pendingApplications ?? 0} />
        <ComingSoonPanel title="Pending Results for Approval" description="Arrives with the results approval workflow." />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <StatCard icon={Banknote} label="Fees Collected (This Month)" value={formatNaira(feesCollectedThisMonth)} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/admin/attendance" className="rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-gold-400">
          View Attendance Overview
        </Link>
        <Link href="/dashboard/admin/students" className="rounded-full border border-navy-900/15 px-5 py-2.5 text-sm font-semibold text-navy-800 hover:bg-navy-50">
          Student Records
        </Link>
        <Link href="/dashboard/admissions" className="rounded-full border border-navy-900/15 px-5 py-2.5 text-sm font-semibold text-navy-800 hover:bg-navy-50">
          Review Applications
        </Link>
        <Link href="/dashboard/admin/invoices" className="rounded-full border border-navy-900/15 px-5 py-2.5 text-sm font-semibold text-navy-800 hover:bg-navy-50">
          Invoices &amp; Payments
        </Link>
      </div>
    </div>
  );
}
