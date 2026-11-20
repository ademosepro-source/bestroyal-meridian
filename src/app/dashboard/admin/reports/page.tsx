import Link from "next/link";
import { Banknote, CalendarCheck, FileSpreadsheet, GraduationCap, Users } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/get-current-user";

const ALL_REPORTS = [
  { href: "/dashboard/admin/reports/students", label: "Student Register", description: "Every student, filterable by class and status.", icon: Users, roles: ["super_admin", "principal", "admissions_officer"] },
  { href: "/dashboard/admin/reports/admissions", label: "Admission Register", description: "All applications, filterable by status and date.", icon: FileSpreadsheet, roles: ["super_admin", "principal", "admissions_officer"] },
  { href: "/dashboard/admin/reports/attendance", label: "Attendance Report", description: "Per-student attendance for a class and term.", icon: CalendarCheck, roles: ["super_admin", "principal"] },
  { href: "/dashboard/admin/reports/academic", label: "Academic Performance", description: "Class results, subject averages and positions.", icon: GraduationCap, roles: ["super_admin", "principal"] },
  { href: "/dashboard/admin/reports/financial", label: "Financial Report", description: "Collections, outstanding fees and payment history.", icon: Banknote, roles: ["super_admin", "principal", "bursar"] },
];

export default async function ReportsIndexPage() {
  const profile = await getCurrentProfile();
  const reports = ALL_REPORTS.filter((r) => profile && r.roles.includes(profile.role));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Reports
        </h1>
        <p className="mt-1 text-sm text-slate-500">Filter by class, session or term, then export to CSV or print.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5 hover:bg-navy-50/40">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <p className="mt-4 font-semibold text-navy-900">{label}</p>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
