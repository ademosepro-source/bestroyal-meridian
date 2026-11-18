import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-user";
import { amountPaid, formatNaira, invoiceTotal, outstandingBalance } from "@/lib/finance/invoices";
import { recordManualPayment, reversePayment, verifyBankTransfer } from "@/app/dashboard/admin/invoices/actions";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  successful: "bg-emerald-50 text-emerald-700",
  failed: "bg-crimson-500/10 text-crimson-600",
  reversed: "bg-slate-100 text-slate-500",
};

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();
  if (!invoice) notFound();

  const [{ data: student }, { data: classRow }, { data: term }, { data: items }, { data: payments }] = await Promise.all([
    supabase.from("students").select("first_name, surname, admission_number").eq("id", invoice.student_id).single(),
    supabase.from("classes").select("name").eq("id", invoice.class_id).single(),
    supabase.from("terms").select("name").eq("id", invoice.term_id).single(),
    supabase.from("invoice_items").select("*").eq("invoice_id", id),
    supabase.from("payments").select("*").eq("invoice_id", id).order("created_at", { ascending: false }),
  ]);

  const total = invoiceTotal(items ?? []);
  const paid = amountPaid(payments ?? []);
  const outstanding = outstandingBalance(items ?? [], payments ?? []);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          {invoice.invoice_number}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {student?.first_name} {student?.surname} ({student?.admission_number}) · {classRow?.name} · {term?.name}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-navy-900/5">
          <p className="text-xs uppercase text-slate-400">Total</p>
          <p className="mt-1 font-semibold text-navy-900">{formatNaira(total)}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-navy-900/5">
          <p className="text-xs uppercase text-slate-400">Paid</p>
          <p className="mt-1 font-semibold text-emerald-600">{formatNaira(paid)}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-navy-900/5">
          <p className="text-xs uppercase text-slate-400">Outstanding</p>
          <p className="mt-1 font-semibold text-crimson-600">{formatNaira(outstanding)}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
        <h2 className="font-semibold text-navy-900">Fee Breakdown</h2>
        <ul className="mt-3 divide-y divide-navy-900/5 text-sm">
          {(items ?? []).map((item) => (
            <li key={item.id} className="flex justify-between py-2">
              <span>{item.description}</span>
              <span className="font-medium text-navy-900">{formatNaira(Number(item.amount))}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
        <h2 className="font-semibold text-navy-900">Payments</h2>
        <ul className="mt-3 divide-y divide-navy-900/5 text-sm">
          {(payments ?? []).map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="font-medium text-navy-900">{formatNaira(Number(p.amount))} · <span className="capitalize">{p.method.replace("_", " ")}</span></p>
                <p className="text-xs text-slate-400">{new Date(p.created_at).toLocaleString()} {p.remarks && `· ${p.remarks}`}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[p.status]}`}>{p.status}</span>
                {p.status === "successful" && p.receipt_number && (
                  <Link href={`/dashboard/receipts/${p.id}`} className="text-xs font-semibold text-navy-700 hover:underline">
                    Receipt
                  </Link>
                )}
                {p.status === "pending" && p.method === "bank_transfer" && (
                  <form action={verifyBankTransfer.bind(null, p.id, id)}>
                    <button className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700">
                      Verify
                    </button>
                  </form>
                )}
                {p.status === "successful" && profile?.role === "super_admin" && (
                  <form action={reversePayment.bind(null, p.id, id)}>
                    <button className="rounded-full border border-crimson-600 px-3 py-1 text-xs font-semibold text-crimson-600 hover:bg-crimson-50">
                      Reverse
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
          {(!payments || payments.length === 0) && <li className="py-3 text-sm text-slate-400">No payments recorded yet.</li>}
        </ul>

        {outstanding > 0 && (
          <form action={recordManualPayment.bind(null, id, invoice.student_id)} className="mt-5 grid grid-cols-2 gap-3 border-t border-navy-900/5 pt-5">
            <input name="amount" type="number" min={0.01} step="0.01" max={outstanding} required placeholder={`Amount (up to ${formatNaira(outstanding)})`} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm" />
            <select name="method" required className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm">
              <option value="cash">Cash</option>
              <option value="pos">POS</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
            <input name="remarks" placeholder="Remarks (optional)" className="col-span-2 rounded-lg border border-navy-900/15 px-3 py-2 text-sm" />
            <button type="submit" className="col-span-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
              Record Payment
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
