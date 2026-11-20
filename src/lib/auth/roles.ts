export const ROLES = [
  "super_admin",
  "principal",
  "teacher",
  "bursar",
  "admissions_officer",
  "parent",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Administrator",
  principal: "Head Teacher / Principal",
  teacher: "Teacher",
  bursar: "Accountant / Bursar",
  admissions_officer: "Admissions Officer",
  parent: "Parent / Guardian",
};

/** Where each role lands after login. */
export const ROLE_HOME_PATH: Record<Role, string> = {
  super_admin: "/dashboard/admin",
  principal: "/dashboard/principal",
  teacher: "/dashboard/teacher",
  bursar: "/dashboard/bursar",
  admissions_officer: "/dashboard/admissions",
  parent: "/dashboard/parent",
};

/**
 * Which roles may open which dashboard section. Staff dashboards are
 * role-exclusive by design. Checked by longest-prefix match (see
 * `updateSession` in `middleware.ts`), so a specific sub-path here (e.g.
 * "/dashboard/admin/fees") overrides the bare "/dashboard/admin" fallback
 * for everyone except super_admin.
 */
export const ROLE_ACCESS: Record<string, Role[]> = {
  "/dashboard/admin": ["super_admin"],
  "/dashboard/admin/students": ["super_admin", "principal"],
  "/dashboard/admin/classes": ["super_admin", "principal"],
  "/dashboard/admin/attendance": ["super_admin", "principal"],
  "/dashboard/admin/grading": ["super_admin", "principal"],
  "/dashboard/admin/report-cards": ["super_admin", "principal"],
  "/dashboard/admin/announcements": ["super_admin", "principal"],
  "/dashboard/admin/events": ["super_admin", "principal"],
  "/dashboard/admin/reports": ["super_admin", "principal", "bursar", "admissions_officer"],
  "/dashboard/admin/fees": ["super_admin", "principal", "bursar"],
  "/dashboard/admin/invoices": ["super_admin", "principal", "bursar"],
  "/dashboard/admissions": ["super_admin", "principal", "admissions_officer"],
  "/dashboard/principal": ["principal", "super_admin"],
  "/dashboard/teacher": ["teacher", "super_admin"],
  "/dashboard/bursar": ["bursar", "super_admin"],
  "/dashboard/parent": ["parent"],
};

export function isRole(value: string | null | undefined): value is Role {
  return !!value && (ROLES as readonly string[]).includes(value);
}
