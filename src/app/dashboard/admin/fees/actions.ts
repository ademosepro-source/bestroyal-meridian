"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import { feeCategorySchema, feeStructureSchema } from "@/lib/validations/fees";

async function assertFinance() {
  await requireRole("super_admin", "principal", "bursar");
}

export async function createFeeCategory(formData: FormData) {
  await assertFinance();
  const parsed = feeCategorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase.from("fee_categories").insert({
    name: parsed.data.name,
    description: parsed.data.description || null,
  });
  revalidatePath("/dashboard/admin/fees");
}

export async function deleteFeeCategory(id: string) {
  await assertFinance();
  const supabase = await createClient();
  await supabase.from("fee_categories").delete().eq("id", id);
  revalidatePath("/dashboard/admin/fees");
}

export async function createFeeStructure(formData: FormData) {
  await assertFinance();
  const parsed = feeStructureSchema.safeParse({
    class_id: formData.get("class_id"),
    term_id: formData.get("term_id"),
    fee_category_id: formData.get("fee_category_id"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase.from("fee_structures").upsert(parsed.data, {
    onConflict: "class_id,term_id,fee_category_id",
  });
  revalidatePath("/dashboard/admin/fees");
}

export async function deleteFeeStructure(id: string) {
  await assertFinance();
  const supabase = await createClient();
  await supabase.from("fee_structures").delete().eq("id", id);
  revalidatePath("/dashboard/admin/fees");
}
