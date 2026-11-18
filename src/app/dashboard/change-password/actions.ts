"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-user";
import { ROLE_HOME_PATH } from "@/lib/auth/roles";

export type ChangePasswordState = { error: string | null };

export async function changePassword(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) {
    return { error: "Could not update your password. Please try again." };
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  await supabase.from("profiles").update({ must_change_password: false }).eq("id", profile.id);

  redirect(ROLE_HOME_PATH[profile.role]);
}
