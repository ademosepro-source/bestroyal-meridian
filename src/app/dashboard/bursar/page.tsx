import Link from "next/link";
import { Banknote, FileText, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatNaira, invoiceTotal, outstandingBalance } from "@/lib/finance/invoices";

export default async function BursarDashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: invoices }, { data: items }, { data: payments }, { data: todayPayments }] = await Promise.all([
    supabase.from("invoices").select("id"),
    supabase.from("invoice_items").select("invoice_id, amount"),
    supabase.from("payments").select("invoice_id, amount, status"),
    supabase.from("payments").select("amount").eq("status", "successful").gte("paid_at", `${today}T00:00:00`),
  ]);

  const invoiceIds = (invoices ?? []).map((i) => i.id);
  const totalExpected = invoiceTotal(items ?? []);
  const totalCollected = (payments ?? []).filter((p) => p.status === "successful").reduce((s, p) => s + Number(p.amount), 0);
  const totalOutstanding = invoiceIds.reduce((sum, id) => {
    const invItems = (items ?? []).filter((i) => i.invoice_id === id);
    const invPayments = (payments ?? []).filter((p) => p.invoice_id === id);
    return sum + outstandingBalance(invItems, invPayments);
  }, 0);
  const todayTotal = (todayPayments ?? []).reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Accountant / Bursar Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">Fee management, invoicing and payments.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Banknote} label="Total Expected Fees" value={formatNaira(totalExpected)} />
        <StatCard icon={Receipt} label="Total Collected" value={formatNaira(totalCollected)} />
        <StatCard icon={FileText} label="Outstanding Fees" value={formatNaira(totalOutstanding)} />
        <StatCard icon={Banknote} label="Collected Today" value={formatNaira(todayTotal)} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/admin/invoices" className="rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-gold-400">
          Invoices & Payments
        </Link>
        <Link href="/dashboard/admin/fees" className="rounded-full border border-navy-900/15 px-5 py-2.5 text-sm font-semibold text-navy-800 hover:bg-navy-50">
          Fee Configuration
        </Link>
      </div>
    </div>
  );
}
