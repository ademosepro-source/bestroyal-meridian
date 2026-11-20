"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import { getParentIdsForStudent, notify } from "@/lib/notifications/create";
import { formatNaira, outstandingBalance } from "@/lib/finance/invoices";

async function assertFinance() {
  return requireRole("super_admin", "principal", "bursar");
}

async function generateForStudent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
  classId: string,
  termId: string,
  generatedBy: string,
) {
  const { data: existing } = await supabase
    .from("invoices")
    .select("id")
    .eq("student_id", studentId)
    .eq("term_id", termId)
    .maybeSingle();
  if (existing) return;

  const { data: structures } = await supabase
    .from("fee_structures")
    .select("fee_category_id, amount")
    .eq("class_id", classId)
    .eq("term_id", termId);

  if (!structures || structures.length === 0) return;

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({ student_id: studentId, class_id: classId, term_id: termId, generated_by: generatedBy })
    .select("id")
    .single();

  if (error || !invoice) return;

  const { data: categories } = await supabase
    .from("fee_categories")
    .select("id, name")
    .in("id", structures.map((s) => s.fee_category_id));
  const categoryNameById = new Map((categories ?? []).map((c) => [c.id, c.name]));

  await supabase.from("invoice_items").insert(
    structures.map((s) => ({
      invoice_id: invoice.id,
      fee_category_id: s.fee_category_id,
      description: categoryNameById.get(s.fee_category_id) ?? "Fee",
      amount: s.amount,
    })),
  );
}

export async function generateInvoicesForClass(classId: string, termId: string) {
  const profile = await assertFinance();
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", classId)
    .eq("status", "active");

  for (const student of students ?? []) {
    await generateForStudent(supabase, student.id, classId, termId, profile.id);
  }

  revalidatePath("/dashboard/admin/invoices");
}

export async function recordManualPayment(invoiceId: string, studentId: string, formData: FormData) {
  const profile = await assertFinance();
  const supabase = await createClient();

  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") ?? "cash") as "cash" | "bank_transfer" | "pos";
  const remarks = String(formData.get("remarks") ?? "").trim() || null;

  if (!amount || amount <= 0) return;

  // Cash and POS are confirmed in person; a bank transfer needs separate
  // verification before it counts toward the balance.
  const status = method === "bank_transfer" ? "pending" : "successful";

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      invoice_id: invoiceId,
      student_id: studentId,
      amount,
      method,
      status,
      reference: `MAN-${crypto.randomUUID()}`,
      recorded_by: profile.id,
      paid_at: status === "successful" ? new Date().toISOString() : null,
      remarks,
    })
    .select("id")
    .single();

  if (!error && payment) {
    await supabase.from("audit_logs").insert({
      actor_id: profile.id,
      action: "payment_recorded",
      entity_type: "payment",
      entity_id: payment.id,
      metadata: { method, amount, status },
    });

    if (status === "successful") {
      const parentIds = await getParentIdsForStudent(supabase, studentId);
      await notify(supabase, parentIds, {
        type: "payment",
        title: `Payment of ${formatNaira(amount)} received`,
        body: `Recorded via ${method.replace("_", " ")}.`,
        link: `/dashboard/parent/fees`,
      });
    }
  }

  revalidatePath(`/dashboard/admin/invoices/${invoiceId}`);
}

export async function verifyBankTransfer(paymentId: string, invoiceId: string) {
  const profile = await assertFinance();
  const supabase = await createClient();

  const { data: payment } = await supabase
    .from("payments")
    .update({ status: "successful", verified_by: profile.id, verified_at: new Date().toISOString(), paid_at: new Date().toISOString() })
    .eq("id", paymentId)
    .eq("status", "pending")
    .select("student_id, amount")
    .maybeSingle();

  await supabase.from("audit_logs").insert({
    actor_id: profile.id,
    action: "payment_verified",
    entity_type: "payment",
    entity_id: paymentId,
  });

  if (payment) {
    const parentIds = await getParentIdsForStudent(supabase, payment.student_id);
    await notify(supabase, parentIds, {
      type: "payment",
      title: `Bank transfer of ${formatNaira(Number(payment.amount))} verified`,
      link: `/dashboard/parent/fees`,
    });
  }

  revalidatePath(`/dashboard/admin/invoices/${invoiceId}`);
}

export async function sendFeeReminders(termId: string) {
  await assertFinance();
  const supabase = await createClient();

  const { data: invoices } = await supabase.from("invoices").select("id, student_id").eq("term_id", termId);
  if (!invoices || invoices.length === 0) return;

  const invoiceIds = invoices.map((i) => i.id);
  const [{ data: items }, { data: payments }] = await Promise.all([
    supabase.from("invoice_items").select("invoice_id, amount").in("invoice_id", invoiceIds),
    supabase.from("payments").select("invoice_id, amount, status").in("invoice_id", invoiceIds),
  ]);

  for (const invoice of invoices) {
    const invItems = (items ?? []).filter((i) => i.invoice_id === invoice.id);
    const invPayments = (payments ?? []).filter((p) => p.invoice_id === invoice.id);
    const outstanding = outstandingBalance(invItems, invPayments);
    if (outstanding <= 0) continue;

    const parentIds = await getParentIdsForStudent(supabase, invoice.student_id);
    await notify(supabase, parentIds, {
      type: "fee_reminder",
      title: `Fee reminder: ${formatNaira(outstanding)} outstanding`,
      link: "/dashboard/parent/fees",
    });
  }

  revalidatePath("/dashboard/admin/invoices");
}

export async function reversePayment(paymentId: string, invoiceId: string) {
  // Reversal is deliberately admin-only — a bursar cannot undo their own record.
  const profile = await requireRole("super_admin");
  const supabase = await createClient();

  await supabase.from("payments").update({ status: "reversed" }).eq("id", paymentId);

  await supabase.from("audit_logs").insert({
    actor_id: profile.id,
    action: "payment_reversed",
    entity_type: "payment",
    entity_id: paymentId,
  });

  revalidatePath(`/dashboard/admin/invoices/${invoiceId}`);
}
