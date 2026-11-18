import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-user";
import { ROLE_HOME_PATH } from "@/lib/auth/roles";

export default async function DashboardIndexPage() {
  const profile = await getCurrentProfile();
  redirect(profile ? ROLE_HOME_PATH[profile.role] : "/login");
}
