import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTransaction } from "@/lib/payments/paystack";
import { getParentIdsForStudent, notify } from "@/lib/notifications/create";
import { formatNaira } from "@/lib/finance/invoices";

/**
 * The single place a Paystack payment is ever confirmed. Always re-verifies
 * with Paystack directly — called from both the browser callback and the
 * server-to-server webhook, since either can arrive first (or not at all).
 * Safe to call more than once for the same reference.
 */
export async function confirmPaystackPayment(reference: string) {
  const verification = await verifyTransaction(reference);

  if (!verification.status || !verification.data) {
    return { ok: false as const, reason: "verification_failed" as const };
  }

  const admin = createAdminClient();
  const { data: payment } = await admin.from("payments").select("*").eq("reference", reference).maybeSingle();

  if (!payment) {
    return { ok: false as const, reason: "unknown_reference" as const };
  }

  if (payment.status === "successful") {
    return { ok: true as const, alreadyProcessed: true, invoiceId: payment.invoice_id };
  }

  if (verification.data.status !== "success") {
    await admin.from("payments").update({ status: "failed" }).eq("id", payment.id).eq("status", "pending");
    return { ok: false as const, reason: "not_successful" as const };
  }

  // Paystack amounts are in kobo; our stored amount is in naira.
  const paidNaira = verification.data.amount / 100;
  if (Math.abs(paidNaira - Number(payment.amount)) > 0.01) {
    return { ok: false as const, reason: "amount_mismatch" as const };
  }

  await admin
    .from("payments")
    .update({ status: "successful", paid_at: verification.data.paid_at ?? new Date().toISOString() })
    .eq("id", payment.id)
    .eq("status", "pending");

  await admin.from("audit_logs").insert({
    action: "payment_confirmed_online",
    entity_type: "payment",
    entity_id: payment.id,
    metadata: { reference, gateway: "paystack" },
  });

  const parentIds = await getParentIdsForStudent(admin, payment.student_id);
  await notify(admin, parentIds, {
    type: "payment",
    title: `Online payment of ${formatNaira(Number(payment.amount))} received`,
    link: "/dashboard/parent/fees",
  });

  return { ok: true as const, alreadyProcessed: false, invoiceId: payment.invoice_id };
}
