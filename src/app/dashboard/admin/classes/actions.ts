"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import {
  classArmSchema,
  classSchema,
  subjectSchema,
  subjectTeacherSchema,
  teacherAssignmentSchema,
} from "@/lib/validations/classes";

async function assertManager() {
  await requireRole("super_admin", "principal");
}

export async function createClassRecord(formData: FormData) {
  await assertManager();
  const parsed = classSchema.safeParse({
    name: formData.get("name"),
    level: formData.get("level"),
    order_index: formData.get("order_index"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase.from("classes").insert(parsed.data);
  revalidatePath("/dashboard/admin/classes");
}

export async function createClassArm(formData: FormData) {
  await assertManager();
  const parsed = classArmSchema.safeParse({
    class_id: formData.get("class_id"),
    name: formData.get("name"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase.from("class_arms").insert(parsed.data);
  revalidatePath("/dashboard/admin/classes");
}

export async function createSubject(formData: FormData) {
  await assertManager();
  const parsed = subjectSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    level: formData.get("level") || undefined,
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase.from("subjects").insert({
    name: parsed.data.name,
    code: parsed.data.code || null,
    level: parsed.data.level || null,
  });
  revalidatePath("/dashboard/admin/classes");
}

export async function assignClassTeacher(formData: FormData) {
  await assertManager();
  const parsed = teacherAssignmentSchema.safeParse({
    teacher_id: formData.get("teacher_id"),
    class_id: formData.get("class_id"),
    class_arm_id: formData.get("class_arm_id"),
    is_class_teacher: formData.get("is_class_teacher") === "on",
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase.from("teacher_class_assignments").upsert(
    {
      teacher_id: parsed.data.teacher_id,
      class_id: parsed.data.class_id,
      class_arm_id: parsed.data.class_arm_id || null,
      is_class_teacher: parsed.data.is_class_teacher ?? false,
    },
    { onConflict: "teacher_id,class_id,class_arm_id" },
  );
  revalidatePath("/dashboard/admin/classes");
}

export async function assignSubjectTeacher(formData: FormData) {
  await assertManager();
  const parsed = subjectTeacherSchema.safeParse({
    teacher_id: formData.get("teacher_id"),
    class_id: formData.get("class_id"),
    subject_id: formData.get("subject_id"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase.from("subject_teachers").upsert(parsed.data, { onConflict: "class_id,subject_id" });
  revalidatePath("/dashboard/admin/classes");
}
