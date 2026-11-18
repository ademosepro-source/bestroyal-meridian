import { z } from "zod";

export const staffSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().optional().or(z.literal("")),
  role: z.enum(["principal", "teacher", "bursar", "admissions_officer"]),
  position: z.string().trim().min(1, "Position/title is required"),
  department: z.string().trim().optional().or(z.literal("")),
});

export type StaffInput = z.infer<typeof staffSchema>;
