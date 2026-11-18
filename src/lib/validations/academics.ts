import { z } from "zod";

export const gradeBandSchema = z.object({
  grade: z.string().trim().min(1, "Grade letter is required"),
  min_score: z.coerce.number().min(0).max(100),
  max_score: z.coerce.number().min(0).max(100),
  remark: z.string().trim().min(1, "Remark is required"),
});

export const assessmentComponentSchema = z.object({
  name: z.string().trim().min(1, "Component name is required"),
  max_score: z.coerce.number().min(1).max(100),
  order_index: z.coerce.number().int().min(1),
});

export const scoreEntrySchema = z.object({
  class_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  term_id: z.string().uuid(),
});
