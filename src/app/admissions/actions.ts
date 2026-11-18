"use server";

import { createClient } from "@/lib/supabase/server";
import { admissionApplicationSchema } from "@/lib/validations/admissions";

export type FormState = { error: string | null; success: boolean };

export async function submitApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { success: false, error: "Online applications aren't available yet. Please contact the school directly." };
  }

  const parsed = admissionApplicationSchema.safeParse({
    applicant_first_name: formData.get("applicant_first_name"),
    applicant_middle_name: formData.get("applicant_middle_name"),
    applicant_surname: formData.get("applicant_surname"),
    date_of_birth: formData.get("date_of_birth"),
    gender: formData.get("gender"),
    desired_class_id: formData.get("desired_class_id"),
    previous_school: formData.get("previous_school"),
    parent_full_name: formData.get("parent_full_name"),
    parent_phone: formData.get("parent_phone"),
    parent_email: formData.get("parent_email"),
    parent_relationship: formData.get("parent_relationship"),
    home_address: formData.get("home_address"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("admission_applications").insert({
    applicant_first_name: parsed.data.applicant_first_name,
    applicant_middle_name: parsed.data.applicant_middle_name || null,
    applicant_surname: parsed.data.applicant_surname,
    date_of_birth: parsed.data.date_of_birth,
    gender: parsed.data.gender,
    desired_class_id: parsed.data.desired_class_id || null,
    previous_school: parsed.data.previous_school || null,
    parent_full_name: parsed.data.parent_full_name,
    parent_phone: parsed.data.parent_phone,
    parent_email: parsed.data.parent_email,
    parent_relationship: parsed.data.parent_relationship,
    home_address: parsed.data.home_address || null,
  });

  if (error) {
    return { success: false, error: "Could not submit your application. Please try again." };
  }

  return { success: true, error: null };
}
