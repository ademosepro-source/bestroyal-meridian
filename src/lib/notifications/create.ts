import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

/**
 * Queues an in-app notification. This never sends an email or SMS — no
 * provider is configured (see docs/SETUP.md) — it only ever means "the
 * recipient will see this in their notification bell next time they open
 * the portal." Failing silently on error is intentional: a notification
 * is a courtesy, never allowed to block the action that triggered it.
 */
export async function notify(
  supabase: Client,
  recipientIds: string[],
  notification: { type: string; title: string; body?: string; link?: string },
) {
  const unique = [...new Set(recipientIds)];
  if (unique.length === 0) return;

  await supabase.from("notifications").insert(
    unique.map((recipient_id) => ({
      recipient_id,
      type: notification.type,
      title: notification.title,
      body: notification.body ?? null,
      link: notification.link ?? null,
    })),
  );
}

/** Looks up the parent(s) linked to a student — the common notification target. */
export async function getParentIdsForStudent(supabase: Client, studentId: string) {
  const { data } = await supabase.from("parent_student").select("parent_id").eq("student_id", studentId);
  return (data ?? []).map((row) => row.parent_id);
}
