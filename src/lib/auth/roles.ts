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

/** Which roles may open which dashboard section. Staff dashboards are role-exclusive by design. */
export const ROLE_ACCESS: Record<string, Role[]> = {
  "/dashboard/admin": ["super_admin"],
  "/dashboard/principal": ["principal", "super_admin"],
  "/dashboard/teacher": ["teacher", "super_admin"],
  "/dashboard/bursar": ["bursar", "super_admin"],
  "/dashboard/admissions": ["admissions_officer", "super_admin"],
  "/dashboard/parent": ["parent"],
};

export function isRole(value: string | null | undefined): value is Role {
  return !!value && (ROLES as readonly string[]).includes(value);
}
