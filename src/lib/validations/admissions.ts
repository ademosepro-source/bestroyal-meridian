import { z } from "zod";

export const admissionApplicationSchema = z.object({
  applicant_first_name: z.string().trim().min(1, "Child's first name is required"),
  applicant_middle_name: z.string().trim().optional().or(z.literal("")),
  applicant_surname: z.string().trim().min(1, "Child's surname is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female"]),
  desired_class_id: z.string().uuid().optional().or(z.literal("")),
  previous_school: z.string().trim().optional().or(z.literal("")),
  parent_full_name: z.string().trim().min(1, "Your full name is required"),
  parent_phone: z.string().trim().min(7, "A valid phone number is required"),
  parent_email: z.string().trim().email("Enter a valid email address"),
  parent_relationship: z.string().trim().min(1),
  home_address: z.string().trim().optional().or(z.literal("")),
});

export type AdmissionApplicationInput = z.infer<typeof admissionApplicationSchema>;
