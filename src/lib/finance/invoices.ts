export function invoiceTotal(items: { amount: number }[]) {
  return items.reduce((sum, i) => sum + Number(i.amount), 0);
}

export function amountPaid(payments: { amount: number; status: string }[]) {
  return payments
    .filter((p) => p.status === "successful")
    .reduce((sum, p) => sum + Number(p.amount), 0);
}

export function outstandingBalance(items: { amount: number }[], payments: { amount: number; status: string }[]) {
  return Math.max(0, invoiceTotal(items) - amountPaid(payments));
}

export function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
