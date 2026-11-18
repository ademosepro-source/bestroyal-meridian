"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import { eventSchema } from "@/lib/validations/communications";

async function assertManager() {
  return requireRole("super_admin", "principal");
}

export async function createEvent(formData: FormData) {
  const profile = await assertManager();
  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    location: formData.get("location"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase.from("events").insert({
    title: parsed.data.title,
    description: parsed.data.description || null,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date || null,
    location: parsed.data.location || null,
    created_by: profile.id,
  });

  revalidatePath("/dashboard/admin/events");
  revalidatePath("/");
  revalidatePath("/news");
}

export async function deleteEvent(id: string) {
  await assertManager();
  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", id);
  revalidatePath("/dashboard/admin/events");
  revalidatePath("/");
  revalidatePath("/news");
}
