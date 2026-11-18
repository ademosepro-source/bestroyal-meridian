"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import { getParentIdsForStudent, notify } from "@/lib/notifications/create";

export async function approveReportCard(reportCardId: string, formData: FormData) {
  const profile = await requireRole("super_admin", "principal");
  const principalComment = String(formData.get("principal_comment") ?? "").trim() || null;

  const supabase = await createClient();
  await supabase
    .from("report_cards")
    .update({
      status: "approved",
      principal_comment: principalComment,
      approved_by: profile.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", reportCardId);

  await supabase.from("audit_logs").insert({
    actor_id: profile.id,
    action: "report_card_approved",
    entity_type: "report_card",
    entity_id: reportCardId,
  });

  revalidatePath("/dashboard/admin/report-cards");
}

export async function publishReportCard(reportCardId: string) {
  const profile = await requireRole("super_admin");

  const supabase = await createClient();
  const { data: reportCard } = await supabase
    .from("report_cards")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", reportCardId)
    .select("student_id, term_id")
    .single();

  await supabase.from("audit_logs").insert({
    actor_id: profile.id,
    action: "report_card_published",
    entity_type: "report_card",
    entity_id: reportCardId,
  });

  if (reportCard) {
    const parentIds = await getParentIdsForStudent(supabase, reportCard.student_id);
    await notify(supabase, parentIds, {
      type: "report_card",
      title: "Your child's report card is now available",
      link: `/dashboard/report-cards/${reportCard.student_id}/${reportCard.term_id}`,
    });
  }

  revalidatePath("/dashboard/admin/report-cards");
}
