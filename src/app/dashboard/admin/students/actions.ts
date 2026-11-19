"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import { studentSchema } from "@/lib/validations/students";

export type FormState = { error: string | null };

function emptyToNull(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  return str === "" ? null : str;
}

export async function createStudent(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole("super_admin", "principal");

  const parsed = studentSchema.safeParse({
    first_name: formData.get("first_name"),
    middle_name: formData.get("middle_name"),
    surname: formData.get("surname"),
    date_of_birth: formData.get("date_of_birth"),
    gender: formData.get("gender"),
    class_id: formData.get("class_id"),
    class_arm_id: formData.get("class_arm_id"),
    admission_session_id: formData.get("admission_session_id"),
    previous_school: formData.get("previous_school"),
    home_address: formData.get("home_address"),
    medical_notes: formData.get("medical_notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const supabase = await createClient();

  // Prevent obvious duplicate records (same name + date of birth).
  const { data: existing } = await supabase
    .from("students")
    .select("id")
    .eq("first_name", parsed.data.first_name)
    .eq("surname", parsed.data.surname)
    .eq("date_of_birth", parsed.data.date_of_birth)
    .limit(1);

  if (existing && existing.length > 0) {
    return { error: "A student with this name and date of birth is already registered." };
  }

  const { error } = await supabase.from("students").insert({
    first_name: parsed.data.first_name,
    middle_name: emptyToNull(parsed.data.middle_name ?? null),
    surname: parsed.data.surname,
    date_of_birth: parsed.data.date_of_birth,
    gender: parsed.data.gender,
    class_id: emptyToNull(parsed.data.class_id ?? null),
    class_arm_id: emptyToNull(parsed.data.class_arm_id ?? null),
    admission_session_id: emptyToNull(parsed.data.admission_session_id ?? null),
    previous_school: emptyToNull(parsed.data.previous_school ?? null),
    home_address: emptyToNull(parsed.data.home_address ?? null),
    medical_notes: emptyToNull(parsed.data.medical_notes ?? null),
  });

  if (error) {
    return { error: "Could not register the student. Please try again." };
  }

  revalidatePath("/dashboard/admin/students");
  redirect("/dashboard/admin/students");
}

export async function updateStudent(
  studentId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("super_admin", "principal");

  const parsed = studentSchema.safeParse({
    first_name: formData.get("first_name"),
    middle_name: formData.get("middle_name"),
    surname: formData.get("surname"),
    date_of_birth: formData.get("date_of_birth"),
    gender: formData.get("gender"),
    class_id: formData.get("class_id"),
    class_arm_id: formData.get("class_arm_id"),
    admission_session_id: formData.get("admission_session_id"),
    previous_school: formData.get("previous_school"),
    home_address: formData.get("home_address"),
    medical_notes: formData.get("medical_notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({
      first_name: parsed.data.first_name,
      middle_name: emptyToNull(parsed.data.middle_name ?? null),
      surname: parsed.data.surname,
      date_of_birth: parsed.data.date_of_birth,
      gender: parsed.data.gender,
      class_id: emptyToNull(parsed.data.class_id ?? null),
      class_arm_id: emptyToNull(parsed.data.class_arm_id ?? null),
      previous_school: emptyToNull(parsed.data.previous_school ?? null),
      home_address: emptyToNull(parsed.data.home_address ?? null),
      medical_notes: emptyToNull(parsed.data.medical_notes ?? null),
    })
    .eq("id", studentId);

  if (error) {
    return { error: "Could not save changes. Please try again." };
  }

  revalidatePath("/dashboard/admin/students");
  revalidatePath(`/dashboard/admin/students/${studentId}`);
  return { error: null };
}

export async function setStudentStatus(studentId: string, status: "active" | "withdrawn" | "graduated") {
  await requireRole("super_admin", "principal");
  const supabase = await createClient();
  await supabase.from("students").update({ status }).eq("id", studentId);
  revalidatePath("/dashboard/admin/students");
  revalidatePath(`/dashboard/admin/students/${studentId}`);
}

export async function deleteStudent(studentId: string) {
  // Only the Super Administrator deletes a student's record.
  await requireRole("super_admin");

  const supabase = await createClient();
  // Cascades to this student's attendance, exam scores, report cards,
  // invoices/payments and parent links (see the "on delete" rules in the schema).
  const { error } = await supabase.from("students").delete().eq("id", studentId);

  if (error) {
    throw new Error("Could not delete this student's record. Please try again.");
  }

  revalidatePath("/dashboard/admin/students");
  redirect("/dashboard/admin/students");
}
