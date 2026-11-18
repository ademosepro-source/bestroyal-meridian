"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/require-role";
import { staffSchema } from "@/lib/validations/staff";

export type FormState = { error: string | null };

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

  // Creates the account and emails the staff member an invite link to set
  // their own password (requires SMTP/email to be configured in Supabase —
  // see docs/SETUP.md).
  const { data: created, error: createError } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    { data: { full_name: parsed.data.full_name, role: parsed.data.role } },
  );

  if (createError || !created.user) {
    return {
      error: createError?.message.includes("already been registered")
        ? "A user with this email already exists."
        : "Could not create the account. Please try again.",
    };
  }

  const { error: staffError } = await admin.from("staff").insert({
    id: created.user.id,
    position: parsed.data.position,
    department: parsed.data.department || null,
  });

  if (staffError) {
    return { error: "Account was created but the staff record failed to save. Contact support." };
  }

  if (parsed.data.phone) {
    await admin.from("profiles").update({ phone: parsed.data.phone }).eq("id", created.user.id);
  }

  revalidatePath("/dashboard/admin/staff");
  redirect("/dashboard/admin/staff");
}
