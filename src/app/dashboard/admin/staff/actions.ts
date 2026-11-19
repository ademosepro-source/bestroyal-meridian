"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/require-role";
import { staffSchema } from "@/lib/validations/staff";
import { createUserWithPassword } from "@/lib/auth/create-user-with-password";

export type FormState = { error: string | null; password?: string; email?: string };

export async function createStaffAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  // Only the Super Administrator creates staff accounts (see role capability list).
  await requireRole("super_admin");

  const parsed = staffSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    role: formData.get("role"),
    position: formData.get("position"),
    department: formData.get("department"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const admin = createAdminClient();

  const created = await createUserWithPassword(admin, parsed.data.email, {
    full_name: parsed.data.full_name,
    role: parsed.data.role,
  });

  if (!created.ok) {
    return { error: created.error };
  }

  const { error: staffError } = await admin.from("staff").insert({
    id: created.userId,
    position: parsed.data.position,
    department: parsed.data.department || null,
  });

  if (staffError) {
    return { error: "Account was created but the staff record failed to save. Contact support." };
  }

  if (parsed.data.phone) {
    await admin.from("profiles").update({ phone: parsed.data.phone }).eq("id", created.userId);
  }

  revalidatePath("/dashboard/admin/staff");
  return { error: null, password: created.password, email: parsed.data.email };
}

export async function deleteStaffAccount(staffId: string) {
  // Only the Super Administrator deletes staff accounts.
  const profile = await requireRole("super_admin");

  if (profile.id === staffId) {
    throw new Error("You cannot delete your own account.");
  }

  const admin = createAdminClient();
  // Deleting the auth user cascades to the profile row, which cascades to the
  // staff row and every record that references it (class/subject assignments,
  // report cards submitted, etc. — see the "on delete" rules in the schema).
  const { error } = await admin.auth.admin.deleteUser(staffId);

  if (error) {
    throw new Error("Could not delete this staff account. Please try again.");
  }

  revalidatePath("/dashboard/admin/staff");
}
