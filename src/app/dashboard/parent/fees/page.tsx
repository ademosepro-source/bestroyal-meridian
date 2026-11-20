import Link from "next/link";
import { Banknote } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-user";
import { EmptyState } from "@/components/ui/empty-state";
import { amountPaid, formatNaira, invoiceTotal, outstandingBalance } from "@/lib/finance/invoices";
import { isPaystackConfigured } from "@/lib/payments/paystack";
import { initiatePaystackPayment } from "@/app/dashboard/parent/fees/actions";

export default async function ParentFeesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: links } = await supabase.from("parent_student").select("student_id").eq("parent_id", profile?.id ?? "");
  const studentIds = (links ?? []).map((l) => l.student_id);

  const { data: invoices } =
    studentIds.length > 0
      ? await supabase.from("invoices").select("*").in("student_id", studentIds).order("created_at", { ascending: false })
      : { data: [] };

  const invoiceIds = (invoices ?? []).map((i) => i.id);
  const [{ data: items }, { data: payments }, { data: students }, { data: terms }] = await Promise.all([
    invoiceIds.length ? supabase.from("invoice_items").select("*").in("invoice_id", invoiceIds) : { data: [] },
    invoiceIds.length ? supabase.from("payments").select("*").in("invoice_id", invoiceIds).order("created_at", { ascending: false }) : { data: [] },
    studentIds.length ? supabase.from("students").select("id, first_name, surname").in("id", studentIds) : { data: [] },
    invoiceIds.length ? supabase.from("terms").select("id, name").in("id", (invoices ?? []).map((i) => i.term_id)) : { data: [] },
  ]);

  const studentById = new Map((students ?? []).map((s) => [s.id, s]));
  const termNameById = new Map((terms ?? []).map((t) => [t.id, t.name]));

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          School Fees
        </h1>
        <p className="mt-1 text-sm text-slate-500">View invoices and pay online securely.</p>
      </div>

      {error && <p className="rounded-lg bg-crimson-500/10 px-4 py-2.5 text-sm text-crimson-600">{error}</p>}
      {success && <p className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{success}</p>}

      {!invoices || invoices.length === 0 ? (
        <EmptyState icon={Banknote} title="No invoices yet" description="Invoices will appear here once the school issues them for your child's class." />
      ) : (
        <div className="space-y-5">
          {invoices.map((inv) => {
            const invItems = (items ?? []).filter((i) => i.invoice_id === inv.id);
            const invPayments = (payments ?? []).filter((p) => p.invoice_id === inv.id);
            const total = invoiceTotal(invItems);
            const paid = amountPaid(invPayments);
            const outstanding = outstandingBalance(invItems, invPayments);
            const student = studentById.get(inv.student_id);

            return (
              <div key={inv.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-navy-900">{inv.invoice_number} — {student?.first_name} {student?.surname}</p>
                    <p className="text-xs text-slate-500">{termNameById.get(inv.term_id)}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-slate-500">Total {formatNaira(total)} · Paid {formatNaira(paid)}</p>
                    <p className="font-semibold text-crimson-600">Outstanding {formatNaira(outstanding)}</p>
                  </div>
                </div>

                {outstanding > 0 && isPaystackConfigured() && (
                  <form action={initiatePaystackPayment.bind(null, inv.id)} className="mt-4 flex flex-wrap items-center gap-3 border-t border-navy-900/5 pt-4">
                    <input
                      name="amount"
                      type="number"
                      min={1}
                      max={outstanding}
                      step="0.01"
                      placeholder={`Full amount: ${formatNaira(outstanding)}`}
                      className="w-56 rounded-lg border border-navy-900/15 px-3 py-2 text-sm"
                    />
                    <button className="rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-gold-400">
                      Pay with Paystack
                    </button>
                  </form>
                )}

                {invPayments.filter((p) => p.status === "successful").length > 0 && (
                  <div className="mt-4 border-t border-navy-900/5 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Payment History</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {invPayments.filter((p) => p.status === "successful").map((p) => (
                        <li key={p.id} className="flex items-center justify-between">
                          <span className="text-slate-600">{formatNaira(Number(p.amount))} · {new Date(p.created_at).toLocaleDateString()}</span>
                          <Link href={`/dashboard/receipts/${p.id}`} className="text-xs font-semibold text-navy-700 hover:underline">
                            View Receipt
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {invPayments.filter((p) => p.status === "pending").length > 0 && (
                  <div className="mt-4 border-t border-navy-900/5 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Awaiting Confirmation</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {invPayments.filter((p) => p.status === "pending").map((p) => (
                        <li key={p.id} className="flex items-center justify-between text-amber-700">
                          <span>{formatNaira(Number(p.amount))} · {p.method === "paystack" ? "Online payment" : "Bank transfer"} · {new Date(p.created_at).toLocaleDateString()}</span>
                          <span className="text-xs font-semibold">
                            {p.method === "paystack" ? "Awaiting payment" : "Awaiting verification"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
