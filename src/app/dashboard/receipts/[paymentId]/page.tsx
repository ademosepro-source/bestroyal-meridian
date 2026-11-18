import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-user";
import { formatNaira } from "@/lib/finance/invoices";
import { PrintButton } from "@/components/dashboard/print-button";

export default async function ReceiptPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: payment } = await supabase.from("payments").select("*").eq("id", paymentId).maybeSingle();
  if (!payment || payment.status !== "successful") notFound();

  if (profile.role === "parent") {
    const { data: link } = await supabase
      .from("parent_student")
      .select("student_id")
      .eq("parent_id", profile.id)
      .eq("student_id", payment.student_id)
      .maybeSingle();
    if (!link) notFound();
  }

  const [{ data: student }, { data: invoice }, { data: settings }] = await Promise.all([
    supabase.from("students").select("first_name, surname, admission_number").eq("id", payment.student_id).single(),
    supabase.from("invoices").select("invoice_number").eq("id", payment.invoice_id).single(),
    supabase.from("school_settings").select("*").maybeSingle(),
  ]);

  return (
    <div className="mx-auto max-w-xl bg-white p-10 shadow-sm ring-1 ring-navy-900/5 print:shadow-none print:ring-0">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <header className="flex items-center gap-4 border-b-2 border-navy-900 pb-4">
        <Image src="/images/brand/school-logo.png" alt="School crest" width={56} height={56} className="h-14 w-14 object-contain" />
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-bold text-navy-900">
            {settings?.school_name ?? "BestRoyal Meridian Nursery & Primary School"}
          </p>
          <p className="text-xs uppercase tracking-wider text-gold-700">Official Payment Receipt</p>
        </div>
      </header>

      <dl className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between"><dt className="text-slate-500">Receipt No.</dt><dd className="font-semibold text-navy-900">{payment.receipt_number}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">Date</dt><dd>{payment.paid_at ? new Date(payment.paid_at).toLocaleString() : "—"}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">Invoice</dt><dd>{invoice?.invoice_number}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">Student</dt><dd>{student?.first_name} {student?.surname} ({student?.admission_number})</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">Payment Method</dt><dd className="capitalize">{payment.method.replace("_", " ")}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">Reference</dt><dd className="text-xs">{payment.reference}</dd></div>
      </dl>

      <div className="mt-6 border-t-2 border-navy-900 pt-4 text-right">
        <p className="text-xs uppercase text-slate-400">Amount Paid</p>
        <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-navy-900">{formatNaira(Number(payment.amount))}</p>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">Thank you. This receipt was generated automatically by the school management system.</p>
    </div>
  );
}
