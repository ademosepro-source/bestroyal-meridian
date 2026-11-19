"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-user";
import { CHARACTER_TRAITS, PSYCHOMOTOR_SKILLS } from "@/lib/academics/skills";

export async function submitReportCard(
  studentId: string,
  classId: string,
  termId: string,
  formData: FormData,
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher") return;

  const teacherComment = String(formData.get("teacher_comment") ?? "").trim() || null;
  const promotionStatus = String(formData.get("promotion_status") ?? "").trim() || null;

  const characterRatings: Record<string, number> = {};
  for (const trait of CHARACTER_TRAITS) {
    const value = Number(formData.get(`char_${trait.key}`));
    if (value >= 1 && value <= 5) characterRatings[trait.key] = value;
  }

  const psychomotorRatings: Record<string, number> = {};
  for (const skill of PSYCHOMOTOR_SKILLS) {
    const value = Number(formData.get(`psych_${skill.key}`));
    if (value >= 1 && value <= 5) psychomotorRatings[skill.key] = value;
  }

  const supabase = await createClient();
  await supabase.from("report_cards").upsert(
    {
      student_id: studentId,
      class_id: classId,
      term_id: termId,
      teacher_comment: teacherComment,
      promotion_status: promotionStatus,
      character_ratings: characterRatings,
      psychomotor_ratings: psychomotorRatings,
      status: "submitted",
      submitted_by: profile.id,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "student_id,term_id" },
  );

  await supabase.from("audit_logs").insert({
    actor_id: profile.id,
    action: "report_card_submitted",
    entity_type: "report_card",
    entity_id: studentId,
  });

  revalidatePath("/dashboard/teacher/report-cards");
}
