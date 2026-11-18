"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import { announcementSchema } from "@/lib/validations/communications";
import { notify } from "@/lib/notifications/create";

async function assertManager() {
  return requireRole("super_admin", "principal");
}

export async function createAnnouncement(formData: FormData) {
  const profile = await assertManager();
  const parsed = announcementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    audience: formData.get("audience"),
    class_id: formData.get("class_id"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const { data: announcement, error } = await supabase
    .from("announcements")
    .insert({
      title: parsed.data.title,
      body: parsed.data.body,
      audience: parsed.data.audience,
      class_id: parsed.data.audience === "class" ? parsed.data.class_id || null : null,
      published_by: profile.id,
    })
    .select("id, audience, class_id, title")
    .single();

  if (error || !announcement) return;

  // Notify whoever the announcement targets.
  let recipientIds: string[] = [];
  if (announcement.audience === "parents") {
    const { data } = await supabase.from("profiles").select("id").eq("role", "parent");
    recipientIds = (data ?? []).map((p) => p.id);
  } else if (announcement.audience === "staff") {
    const { data } = await supabase.from("profiles").select("id").neq("role", "parent");
    recipientIds = (data ?? []).map((p) => p.id);
  } else if (announcement.audience === "class" && announcement.class_id) {
    const { data: classStudents } = await supabase.from("students").select("id").eq("class_id", announcement.class_id);
    const studentIds = (classStudents ?? []).map((s) => s.id);
    if (studentIds.length > 0) {
      const { data: parentLinks } = await supabase.from("parent_student").select("parent_id").in("student_id", studentIds);
      recipientIds = (parentLinks ?? []).map((p) => p.parent_id);
    }
  }
  // "public" announcements are shown on the website itself; no personal notification needed.

  await notify(supabase, recipientIds, {
    type: "announcement",
    title: `New announcement: ${announcement.title}`,
    link: "/dashboard",
  });

  revalidatePath("/dashboard/admin/announcements");
  revalidatePath("/");
}

export async function deleteAnnouncement(id: string) {
  await assertManager();
  const supabase = await createClient();
  await supabase.from("announcements").delete().eq("id", id);
  revalidatePath("/dashboard/admin/announcements");
  revalidatePath("/");
}
