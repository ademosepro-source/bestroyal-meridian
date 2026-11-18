"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import { sessionSchema, termSchema } from "@/lib/validations/sessions";

async function assertManager() {
  await requireRole("super_admin", "principal");
}

export async function createSession(formData: FormData) {
  await assertManager();
  const parsed = sessionSchema.safeParse({
    name: formData.get("name"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase.from("academic_sessions").insert(parsed.data);
  revalidatePath("/dashboard/admin/sessions");
}

export async function setCurrentSession(sessionId: string) {
  await assertManager();
  const supabase = await createClient();
  await supabase.from("academic_sessions").update({ is_current: false }).neq("id", sessionId);
  await supabase.from("academic_sessions").update({ is_current: true }).eq("id", sessionId);
  revalidatePath("/dashboard/admin/sessions");
}

export async function createTerm(formData: FormData) {
  await assertManager();
  const parsed = termSchema.safeParse({
    session_id: formData.get("session_id"),
    name: formData.get("name"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase.from("terms").insert(parsed.data);
  revalidatePath("/dashboard/admin/sessions");
}

export async function setCurrentTerm(termId: string) {
  await assertManager();
  const supabase = await createClient();
  await supabase.from("terms").update({ is_current: false }).neq("id", termId);
  await supabase.from("terms").update({ is_current: true }).eq("id", termId);
  revalidatePath("/dashboard/admin/sessions");
}
