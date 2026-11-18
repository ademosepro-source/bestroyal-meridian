import { z } from "zod";

export const feeCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
  description: z.string().trim().optional().or(z.literal("")),
});

export const feeStructureSchema = z.object({
  class_id: z.string().uuid("Select a class"),
  term_id: z.string().uuid("Select a term"),
  fee_category_id: z.string().uuid("Select a fee category"),
  amount: z.coerce.number().min(0, "Amount must be zero or more"),
});

export const manualPaymentSchema = z.object({
  invoice_id: z.string().uuid("Select an invoice"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  method: z.enum(["cash", "bank_transfer", "pos"]),
  remarks: z.string().trim().optional().or(z.literal("")),
});
