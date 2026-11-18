"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/require-role";
import type { ApplicationStatus } from "@/types/database";

async function assertAdmissions() {
  return requireRole("super_admin", "admissions_officer");
}

export async function setApplicationStatus(applicationId: string, status: ApplicationStatus, notes?: string) {
  const profile = await assertAdmissions();
  const supabase = await createClient();
  await supabase
    .from("admission_applications")
    .update({ status, reviewed_by: profile.id, review_notes: notes || null })
    .eq("id", applicationId);

  revalidatePath("/dashboard/admissions");
  revalidatePath(`/dashboard/admissions/${applicationId}`);
}

export async function convertApplicationToStudent(applicationId: string, desiredClassId: string | null) {
  await assertAdmissions();

  const supabase = await createClient();
  const { data: application } = await supabase
    .from("admission_applications")
    .select("*")
    .eq("id", applicationId)
    .single();

  if (!application) return;

  const admin = createAdminClient();

  // Find or create the parent's login account.
  let parentId: string | null = null;
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", application.parent_email)
    .maybeSingle();

  if (existingProfile) {
    parentId = existingProfile.id;
  } else {
    const { data: created, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
      application.parent_email,
      { data: { full_name: application.parent_full_name, role: "parent" } },
    );
    if (!inviteError && created.user) {
      parentId = created.user.id;
    }
  }

  const { data: student, error: studentError } = await admin
    .from("students")
    .insert({
      first_name: application.applicant_first_name,
      middle_name: application.applicant_middle_name,
      surname: application.applicant_surname,
      date_of_birth: application.date_of_birth,
      gender: application.gender,
      class_id: desiredClassId ?? application.desired_class_id,
      admission_session_id: application.desired_session_id,
      previous_school: application.previous_school,
      home_address: application.home_address,
    })
    .select("id")
    .single();

  if (studentError || !student) return;

  if (parentId) {
    await admin.from("parent_student").insert({
      parent_id: parentId,
      student_id: student.id,
      relationship: application.parent_relationship,
      is_primary_contact: true,
    });
  }

  await admin
    .from("admission_applications")
    .update({ status: "enrolled", enrolled_student_id: student.id })
    .eq("id", applicationId);

  revalidatePath("/dashboard/admissions");
  redirect(`/dashboard/admin/students/${student.id}`);
}
