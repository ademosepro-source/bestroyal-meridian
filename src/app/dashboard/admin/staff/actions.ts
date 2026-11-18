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
