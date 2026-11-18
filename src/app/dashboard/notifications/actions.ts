"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-user";

export async function markNotificationRead(notificationId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return;

  const supabase = await createClient();
  await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId).eq("recipient_id", profile.id);
  revalidatePath("/dashboard", "layout");
}

export async function markAllNotificationsRead() {
  const profile = await getCurrentProfile();
  if (!profile) return;

  const supabase = await createClient();
  await supabase.from("notifications").update({ is_read: true }).eq("recipient_id", profile.id).eq("is_read", false);
  revalidatePath("/dashboard", "layout");
}
