"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import { assessmentComponentSchema, gradeBandSchema } from "@/lib/validations/academics";

async function assertManager() {
  await requireRole("super_admin", "principal");
}

export async function createGradeBand(formData: FormData) {
  await assertManager();
  const parsed = gradeBandSchema.safeParse({
    grade: formData.get("grade"),
    min_score: formData.get("min_score"),
    max_score: formData.get("max_score"),
    remark: formData.get("remark"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase.from("grade_bands").insert(parsed.data);
  revalidatePath("/dashboard/admin/grading");
}

export async function deleteGradeBand(id: string) {
  await assertManager();
  const supabase = await createClient();
  await supabase.from("grade_bands").delete().eq("id", id);
  revalidatePath("/dashboard/admin/grading");
}

export async function createAssessmentComponent(formData: FormData) {
  await assertManager();
  const parsed = assessmentComponentSchema.safeParse({
    name: formData.get("name"),
    max_score: formData.get("max_score"),
    order_index: formData.get("order_index"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase.from("assessment_components").insert(parsed.data);
  revalidatePath("/dashboard/admin/grading");
}

export async function deleteAssessmentComponent(id: string) {
  await assertManager();
  const supabase = await createClient();
  await supabase.from("assessment_components").delete().eq("id", id);
  revalidatePath("/dashboard/admin/grading");
}
