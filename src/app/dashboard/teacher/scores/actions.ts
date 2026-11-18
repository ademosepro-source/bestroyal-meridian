"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-user";

export type FormState = { error: string | null; success: boolean };

export async function submitScores(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher") {
    return { success: false, error: "You are not authorized to perform this action." };
  }

  const classId = String(formData.get("class_id") ?? "");
  const subjectId = String(formData.get("subject_id") ?? "");
  const termId = String(formData.get("term_id") ?? "");
  const studentIds = formData.getAll("student_id") as string[];
  const componentIds = formData.getAll("component_id") as string[];

  if (!classId || !subjectId || !termId || studentIds.length === 0) {
    return { success: false, error: "Select a class, subject and term first." };
  }

  const supabase = await createClient();
  const records: {
    student_id: string;
    subject_id: string;
    class_id: string;
    term_id: string;
    component_id: string;
    score: number;
    recorded_by: string;
  }[] = [];

  for (const studentId of studentIds) {
    for (const componentId of componentIds) {
      const raw = formData.get(`score_${studentId}_${componentId}`);
      if (raw === null || raw === "") continue;
      const score = Number(raw);
      if (Number.isNaN(score)) continue;

      records.push({
        student_id: studentId,
        subject_id: subjectId,
        class_id: classId,
        term_id: termId,
        component_id: componentId,
        score,
        recorded_by: profile.id,
      });
    }
  }

  if (records.length === 0) {
    return { success: false, error: "Enter at least one score before saving." };
  }

  const { error } = await supabase
    .from("exam_scores")
    .upsert(records, { onConflict: "student_id,subject_id,term_id,component_id" });

  if (error) {
    return { success: false, error: "Could not save scores. Please try again." };
  }

  revalidatePath("/dashboard/teacher/scores");
  return { success: true, error: null };
}
