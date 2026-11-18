import Link from "next/link";
import {
  Banknote,
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Receipt,
  Sliders,
  Users,
} from "lucide-react";
import type { Role } from "@/lib/auth/roles";

const NAV_BY_ROLE: Record<Role, { href: string; label: string; icon: typeof LayoutDashboard }[]> = {
  super_admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/students", label: "Students", icon: Users },
    { href: "/dashboard/admin/staff", label: "Staff", icon: Users },
    { href: "/dashboard/admin/classes", label: "Classes & Subjects", icon: BookOpen },
    { href: "/dashboard/admin/sessions", label: "Academic Sessions", icon: CalendarRange },
    { href: "/dashboard/admissions", label: "Admissions", icon: FileText },
    { href: "/dashboard/admin/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/dashboard/admin/grading", label: "Grading Setup", icon: Sliders },
    { href: "/dashboard/admin/report-cards", label: "Report Cards", icon: GraduationCap },
    { href: "/dashboard/admin/fees", label: "Fee Setup", icon: Banknote },
    { href: "/dashboard/admin/invoices", label: "Invoices & Payments", icon: Receipt },
    { href: "/dashboard/admin/announcements", label: "Announcements", icon: Bell },
    { href: "/dashboard/admin/events", label: "School Calendar", icon: CalendarDays },
    { href: "/dashboard/admin/reports", label: "Reports", icon: LineChart },
  ],
  principal: [
    { href: "/dashboard/principal", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/students", label: "Students", icon: Users },
    { href: "/dashboard/admin/classes", label: "Classes & Subjects", icon: BookOpen },
    { href: "/dashboard/admin/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/dashboard/admin/grading", label: "Grading Setup", icon: Sliders },
    { href: "/dashboard/admin/report-cards", label: "Report Cards", icon: GraduationCap },
    { href: "/dashboard/admin/announcements", label: "Announcements", icon: Bell },
    { href: "/dashboard/admin/events", label: "School Calendar", icon: CalendarDays },
    { href: "/dashboard/admin/reports", label: "Reports", icon: LineChart },
  ],
  teacher: [
    { href: "/dashboard/teacher", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/teacher/attendance", label: "Mark Attendance", icon: ClipboardList },
    { href: "/dashboard/teacher/scores", label: "Enter Scores", icon: GraduationCap },
    { href: "/dashboard/teacher/report-cards", label: "Report Cards", icon: FileText },
  ],
  bursar: [
    { href: "/dashboard/bursar", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/fees", label: "Fee Setup", icon: Banknote },
    { href: "/dashboard/admin/invoices", label: "Invoices & Payments", icon: Receipt },
    { href: "/dashboard/admin/reports", label: "Reports", icon: LineChart },
  ],
  admissions_officer: [
    { href: "/dashboard/admissions", label: "Applications", icon: FileText },
    { href: "/dashboard/admin/reports", label: "Reports", icon: LineChart },
  ],
  parent: [
    { href: "/dashboard/parent", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/parent/fees", label: "School Fees", icon: Banknote },
  ],
};

export function DashboardNav({ role }: { role: Role }) {
  const items = NAV_BY_ROLE[role];

  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50 hover:text-navy-900"
        >
          <Icon className="h-4 w-4" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}
