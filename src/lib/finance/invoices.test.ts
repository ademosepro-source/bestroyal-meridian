import { describe, expect, it } from "vitest";
import { amountPaid, formatNaira, invoiceTotal, outstandingBalance } from "./invoices";

describe("invoiceTotal", () => {
  it("sums line item amounts", () => {
    expect(invoiceTotal([{ amount: 5000 }, { amount: 2500 }])).toBe(7500);
  });
});

describe("amountPaid", () => {
  it("only counts successful payments", () => {
    const payments = [
      { amount: 1000, status: "successful" },
      { amount: 2000, status: "pending" },
      { amount: 500, status: "failed" },
      { amount: 3000, status: "successful" },
    ];
    expect(amountPaid(payments)).toBe(4000);
  });
});

describe("outstandingBalance", () => {
  it("is the total minus what's been paid", () => {
    const items = [{ amount: 10000 }];
    const payments = [{ amount: 4000, status: "successful" }];
    expect(outstandingBalance(items, payments)).toBe(6000);
  });

  it("never goes negative, even if overpaid", () => {
    const items = [{ amount: 1000 }];
    const payments = [{ amount: 1500, status: "successful" }];
    expect(outstandingBalance(items, payments)).toBe(0);
  });

  it("ignores reversed or pending payments toward the balance", () => {
    const items = [{ amount: 10000 }];
    const payments = [
      { amount: 10000, status: "reversed" },
      { amount: 5000, status: "pending" },
    ];
    expect(outstandingBalance(items, payments)).toBe(10000);
  });
});

describe("formatNaira", () => {
  it("formats with the naira sign and two decimal places", () => {
    expect(formatNaira(1000)).toBe("₦1,000.00");
    expect(formatNaira(0)).toBe("₦0.00");
  });
});
