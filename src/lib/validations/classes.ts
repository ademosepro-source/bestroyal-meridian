import { z } from "zod";

export const classSchema = z.object({
  name: z.string().trim().min(1, "Class name is required"),
  level: z.enum(["nursery", "primary"]),
  order_index: z.coerce.number().int().min(1),
});

export const classArmSchema = z.object({
  class_id: z.string().uuid("Select a class"),
  name: z.string().trim().min(1, "Arm name is required (e.g. A, B)"),
});

export const subjectSchema = z.object({
  name: z.string().trim().min(1, "Subject name is required"),
  code: z.string().trim().optional().or(z.literal("")),
  level: z.enum(["nursery", "primary", ""]).optional(),
});

export const teacherAssignmentSchema = z.object({
  teacher_id: z.string().uuid("Select a teacher"),
  class_id: z.string().uuid("Select a class"),
  class_arm_id: z.string().uuid().optional().or(z.literal("")),
  is_class_teacher: z.coerce.boolean().optional(),
});

export const subjectTeacherSchema = z.object({
  teacher_id: z.string().uuid("Select a teacher"),
  class_id: z.string().uuid("Select a class"),
  subject_id: z.string().uuid("Select a subject"),
});
