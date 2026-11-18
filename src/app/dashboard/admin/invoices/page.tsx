import Link from "next/link";
import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNaira, invoiceTotal, outstandingBalance } from "@/lib/finance/invoices";
import { generateInvoicesForClass, sendFeeReminders } from "@/app/dashboard/admin/invoices/actions";

export default async function InvoicesPage() {
  const supabase = await createClient();

  const [{ data: invoices }, { data: classes }, { data: terms }] = await Promise.all([
    supabase.from("invoices").select("id, invoice_number, student_id, class_id, term_id, created_at").order("created_at", { ascending: false }),
    supabase.from("classes").select("id, name").order("order_index"),
    supabase.from("terms").select("id, name, is_current").order("start_date", { ascending: false }),
  ]);

  const invoiceIds = (invoices ?? []).map((i) => i.id);
  const studentIds = [...new Set((invoices ?? []).map((i) => i.student_id))];

  const [{ data: items }, { data: payments }, { data: students }] = await Promise.all([
    invoiceIds.length ? supabase.from("invoice_items").select("invoice_id, amount").in("invoice_id", invoiceIds) : { data: [] },
    invoiceIds.length ? supabase.from("payments").select("invoice_id, amount, status").in("invoice_id", invoiceIds) : { data: [] },
    studentIds.length ? supabase.from("students").select("id, first_name, surname, admission_number").in("id", studentIds) : { data: [] },
  ]);

  const classNameById = new Map((classes ?? []).map((c) => [c.id, c.name]));
  const termNameById = new Map((terms ?? []).map((t) => [t.id, t.name]));
  const studentById = new Map((students ?? []).map((s) => [s.id, s]));
  const currentTerm = (terms ?? []).find((t) => t.is_current);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Invoices
        </h1>
        <p className="mt-1 text-sm text-slate-500">Generate termly invoices from the fee structure, then track balances.</p>
      </div>

      <form action={async (formData: FormData) => {
        "use server";
        await generateInvoicesForClass(String(formData.get("class_id")), String(formData.get("term_id")));
      }} className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-900/5">
        <select name="class_id" required className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm">
          <option value="">Select class</option>
          {(classes ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select name="term_id" required defaultValue={currentTerm?.id} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm">
          <option value="">Select term</option>
          {(terms ?? []).map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400">
          Generate Invoices for Class
        </button>
      </form>

      <form action={async (formData: FormData) => {
        "use server";
        await sendFeeReminders(String(formData.get("term_id")));
      }} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-900/5">
        <select name="term_id" required defaultValue={currentTerm?.id} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm">
          <option value="">Select term</option>
          {(terms ?? []).map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button className="rounded-lg border border-navy-900/15 px-4 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-50">
          Send Fee Reminders for Term
        </button>
        <span className="text-xs text-slate-400">Notifies every parent with an outstanding balance for that term.</span>
      </form>

      {!invoices || invoices.length === 0 ? (
        <EmptyState icon={FileText} title="No invoices yet" description="Generate invoices for a class and term above — one is created per active student from the fee structure." />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5">
          <table className="w-full text-sm">
            <thead className="bg-navy-50/60 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Class / Term</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-right">Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5">
              {invoices.map((inv) => {
                const invItems = (items ?? []).filter((i) => i.invoice_id === inv.id);
                const invPayments = (payments ?? []).filter((p) => p.invoice_id === inv.id);
                const total = invoiceTotal(invItems);
                const outstanding = outstandingBalance(invItems, invPayments);
                const student = studentById.get(inv.student_id);
                return (
                  <tr key={inv.id} className="hover:bg-navy-50/40">
                    <td className="px-5 py-3 font-medium text-navy-900">
                      <Link href={`/dashboard/admin/invoices/${inv.id}`}>{inv.invoice_number}</Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{student?.first_name} {student?.surname}</td>
                    <td className="px-5 py-3 text-slate-600">{classNameById.get(inv.class_id)} · {termNameById.get(inv.term_id)}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{formatNaira(total)}</td>
                    <td className="px-5 py-3 text-right font-semibold">
                      <span className={outstanding > 0 ? "text-crimson-600" : "text-emerald-600"}>{formatNaira(outstanding)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
