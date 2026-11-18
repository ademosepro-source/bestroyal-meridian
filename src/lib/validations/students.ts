import { z } from "zod";

export const studentSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  middle_name: z.string().trim().optional().or(z.literal("")),
  surname: z.string().trim().min(1, "Surname is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female"]),
  class_id: z.string().uuid().optional().or(z.literal("")),
  class_arm_id: z.string().uuid().optional().or(z.literal("")),
  admission_session_id: z.string().uuid().optional().or(z.literal("")),
  previous_school: z.string().trim().optional().or(z.literal("")),
  home_address: z.string().trim().optional().or(z.literal("")),
  medical_notes: z.string().trim().optional().or(z.literal("")),
});

export type StudentInput = z.infer<typeof studentSchema>;

export const studentStatusSchema = z.object({
  status: z.enum(["active", "withdrawn", "graduated"]),
});
