import { createClient } from "@/lib/supabase/server";
import { CsvExportButton } from "@/components/dashboard/csv-export-button";
import { PrintButton } from "@/components/dashboard/print-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Banknote } from "lucide-react";
import { formatNaira, invoiceTotal, outstandingBalance } from "@/lib/finance/invoices";

export default async function FinancialReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; term_id?: string }>;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const { from = today, to = today, term_id } = await searchParams;
  const supabase = await createClient();

  const { data: terms } = await supabase.from("terms").select("id, name, is_current").order("start_date", { ascending: false });
  const currentTerm = (terms ?? []).find((t) => t.is_current);
  const selectedTermId = term_id || currentTerm?.id;

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, method, status, paid_at, student_id, receipt_number")
    .eq("status", "successful")
    .gte("paid_at", `${from}T00:00:00`)
    .lte("paid_at", `${to}T23:59:59`)
    .order("paid_at", { ascending: false });

  const studentIds = [...new Set((payments ?? []).map((p) => p.student_id))];
  const { data: students } = studentIds.length
    ? await supabase.from("students").select("id, first_name, surname").in("id", studentIds)
    : { data: [] };
  const studentById = new Map((students ?? []).map((s) => [s.id, s]));

  const totalCollected = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  const byMethod = (payments ?? []).reduce<Record<string, number>>((acc, p) => {
    acc[p.method] = (acc[p.method] ?? 0) + Number(p.amount);
    return acc;
  }, {});

  const paymentRows = (payments ?? []).map((p) => ({
    "Receipt No.": p.receipt_number ?? "",
    Student: studentById.get(p.student_id) ? `${studentById.get(p.student_id)!.first_name} ${studentById.get(p.student_id)!.surname}` : "",
    Amount: Number(p.amount),
    Method: p.method,
    Date: p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "",
  }));

  let outstandingRows: Record<string, string | number>[] = [];
  if (selectedTermId) {
    const { data: invoices } = await supabase.from("invoices").select("id, student_id, class_id").eq("term_id", selectedTermId);
    const invoiceIds = (invoices ?? []).map((i) => i.id);
    const [{ data: items }, { data: termPayments }, { data: classes }] = await Promise.all([
      invoiceIds.length ? supabase.from("invoice_items").select("invoice_id, amount").in("invoice_id", invoiceIds) : { data: [] },
      invoiceIds.length ? supabase.from("payments").select("invoice_id, amount, status").in("invoice_id", invoiceIds) : { data: [] },
      supabase.from("classes").select("id, name"),
    ]);
    const classNameById = new Map((classes ?? []).map((c) => [c.id, c.name]));
    const outstandingStudentIds = [...new Set((invoices ?? []).map((i) => i.student_id))];
    const { data: outstandingStudents } = outstandingStudentIds.length
      ? await supabase.from("students").select("id, first_name, surname").in("id", outstandingStudentIds)
      : { data: [] };
    const outStudentById = new Map((outstandingStudents ?? []).map((s) => [s.id, s]));

    outstandingRows = (invoices ?? [])
      .map((inv) => {
        const invItems = (items ?? []).filter((i) => i.invoice_id === inv.id);
        const invPayments = (termPayments ?? []).filter((p) => p.invoice_id === inv.id);
        const outstanding = outstandingBalance(invItems, invPayments);
        const student = outStudentById.get(inv.student_id);
        return {
          Student: student ? `${student.first_name} ${student.surname}` : "",
          Class: classNameById.get(inv.class_id) ?? "",
          "Total Billed": invoiceTotal(invItems),
          Outstanding: outstanding,
        };
      })
      .filter((r) => Number(r.Outstanding) > 0);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Financial Report
        </h1>
        <p className="mt-1 text-sm text-slate-500">Collections for a date range, and outstanding balances for a term.</p>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-semibold text-navy-900">Payment History & Daily/Range Summary</h2>
          <div className="flex gap-2 print:hidden">
            <CsvExportButton rows={paymentRows} filename="payment-history" />
            <PrintButton />
          </div>
        </div>

        <form method="get" className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-900/5 print:hidden">
          <input type="date" name="from" defaultValue={from} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm" />
          <input type="date" name="to" defaultValue={to} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm" />
          <input type="hidden" name="term_id" value={selectedTermId ?? ""} />
          <button className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">View</button>
        </form>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-navy-900/5">
            <p className="text-xs uppercase text-slate-400">Total Collected</p>
            <p className="mt-1 font-semibold text-emerald-600">{formatNaira(totalCollected)}</p>
          </div>
          {Object.entries(byMethod).map(([method, amount]) => (
            <div key={method} className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-navy-900/5">
              <p className="text-xs uppercase capitalize text-slate-400">{method.replace("_", " ")}</p>
              <p className="mt-1 font-semibold text-navy-900">{formatNaira(amount)}</p>
            </div>
          ))}
        </div>

        {paymentRows.length === 0 ? (
          <EmptyState icon={Banknote} title="No payments in this range" description="Try a wider date range." />
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5 print:shadow-none print:ring-0">
            <table className="w-full text-sm">
              <thead className="bg-navy-50/60 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Receipt</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-900/5">
                {paymentRows.map((r, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2.5">{r["Receipt No."]}</td>
                    <td className="px-4 py-2.5 font-medium text-navy-900">{r.Student}</td>
                    <td className="px-4 py-2.5 capitalize">{String(r.Method).replace("_", " ")}</td>
                    <td className="px-4 py-2.5 text-right">{formatNaira(Number(r.Amount))}</td>
                    <td className="px-4 py-2.5">{r.Date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-semibold text-navy-900">Outstanding Fees by Term</h2>
          <CsvExportButton rows={outstandingRows} filename="outstanding-fees" />
        </div>

        <form method="get" className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-900/5 print:hidden">
          <input type="hidden" name="from" value={from} />
          <input type="hidden" name="to" value={to} />
          <select name="term_id" defaultValue={selectedTermId} className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm">
            {(terms ?? []).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">View</button>
        </form>

        {outstandingRows.length === 0 ? (
          <EmptyState icon={Banknote} title="No outstanding balances" description="Everyone has paid in full for this term, or no invoices exist yet." />
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5 print:shadow-none print:ring-0">
            <table className="w-full text-sm">
              <thead className="bg-navy-50/60 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3 text-right">Total Billed</th>
                  <th className="px-4 py-3 text-right">Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-900/5">
                {outstandingRows.map((r, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2.5 font-medium text-navy-900">{r.Student}</td>
                    <td className="px-4 py-2.5">{r.Class}</td>
                    <td className="px-4 py-2.5 text-right">{formatNaira(Number(r["Total Billed"]))}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-crimson-600">{formatNaira(Number(r.Outstanding))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
