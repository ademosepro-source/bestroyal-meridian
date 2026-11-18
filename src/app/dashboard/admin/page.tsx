import Link from "next/link";
import { Banknote, CalendarCheck, Cake, FileText, GraduationCap, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatNaira } from "@/lib/finance/invoices";
import { studentsWithBirthdayToday } from "@/lib/students/birthdays";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [{ count: studentCount }, { count: staffCount }, { count: classCount }, { count: pendingApplications }, { data: monthPayments }] =
    await Promise.all([
      supabase.from("students").select("*", { count: "exact", head: true }),
      supabase.from("staff").select("*", { count: "exact", head: true }),
      supabase.from("classes").select("*", { count: "exact", head: true }),
      supabase
        .from("admission_applications")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "under_review"]),
      supabase.from("payments").select("amount").eq("status", "successful").gte("paid_at", monthStart),
    ]);

  const feesCollectedThisMonth = (monthPayments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  const { data: activeStudents } = await supabase
    .from("students")
    .select("id, first_name, surname, date_of_birth")
    .eq("status", "active");
  const birthdaysToday = studentsWithBirthdayToday(activeStudents ?? []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Super Administrator Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          A live overview of the school. Figures below come straight from the database.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={GraduationCap} label="Total Students" value={studentCount ?? 0} />
        <StatCard icon={Users} label="Total Staff" value={staffCount ?? 0} />
        <StatCard icon={CalendarCheck} label="Classes Configured" value={classCount ?? 0} />
        <StatCard icon={FileText} label="Pending Applications" value={pendingApplications ?? 0} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <StatCard icon={Banknote} label="Fees Collected (This Month)" value={formatNaira(feesCollectedThisMonth)} />
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
          <div className="flex items-center gap-2 text-navy-800">
            <Cake className="h-4 w-4 text-gold-600" />
            <p className="text-sm font-semibold">Birthdays Today</p>
          </div>
          {birthdaysToday.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">No birthdays today.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-navy-700">
              {birthdaysToday.map((s) => (
                <li key={s.id}>{s.first_name} {s.surname}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/admin/students/new" className="rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-gold-400">
          Register Student
        </Link>
        <Link href="/dashboard/admin/staff/new" className="rounded-full border border-navy-900/15 px-5 py-2.5 text-sm font-semibold text-navy-800 hover:bg-navy-50">
          Add Staff Member
        </Link>
        <Link href="/dashboard/admissions" className="rounded-full border border-navy-900/15 px-5 py-2.5 text-sm font-semibold text-navy-800 hover:bg-navy-50">
          Review Applications
        </Link>
        <Link href="/dashboard/admin/invoices" className="rounded-full border border-navy-900/15 px-5 py-2.5 text-sm font-semibold text-navy-800 hover:bg-navy-50">
          Invoices & Payments
        </Link>
      </div>
    </div>
  );
}
