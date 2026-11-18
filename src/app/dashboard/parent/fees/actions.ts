"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-user";
import { initializeTransaction, isPaystackConfigured } from "@/lib/payments/paystack";
import { outstandingBalance } from "@/lib/finance/invoices";

export async function initiatePaystackPayment(invoiceId: string, formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "parent") return;

  const supabase = await createClient();

  const { data: invoice } = await supabase.from("invoices").select("student_id").eq("id", invoiceId).maybeSingle();
  if (!invoice) return;

  const { data: link } = await supabase
    .from("parent_student")
    .select("student_id")
    .eq("parent_id", profile.id)
    .eq("student_id", invoice.student_id)
    .maybeSingle();
  if (!link) return;

  const [{ data: items }, { data: payments }] = await Promise.all([
    supabase.from("invoice_items").select("amount").eq("invoice_id", invoiceId),
    supabase.from("payments").select("amount, status").eq("invoice_id", invoiceId),
  ]);

  const outstanding = outstandingBalance(items ?? [], payments ?? []);
  const requested = Number(formData.get("amount"));
  const amount = requested && requested > 0 && requested <= outstanding ? requested : outstanding;

  if (amount <= 0) return;

  if (!isPaystackConfigured()) {
    redirect(`/dashboard/parent/fees?error=Online+payment+is+not+configured+yet`);
  }

  const reference = `PSK-${crypto.randomUUID()}`;

  const { error: insertError } = await supabase.from("payments").insert({
    invoice_id: invoiceId,
    student_id: invoice.student_id,
    amount,
    method: "paystack",
    status: "pending",
    reference,
  });
  if (insertError) return;

  const origin = (await headers()).get("origin") ?? "";
  const init = await initializeTransaction({
    email: profile.email,
    amountNaira: amount,
    reference,
    callbackUrl: `${origin}/api/payments/paystack/callback`,
  });

  if (!init.status || !init.data) {
    redirect(`/dashboard/parent/fees?error=Could+not+start+payment.+Please+try+again`);
  }

  redirect(init.data!.authorization_url);
}
