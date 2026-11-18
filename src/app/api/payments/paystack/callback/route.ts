import { NextResponse, type NextRequest } from "next/server";
import { confirmPaystackPayment } from "@/lib/payments/confirm";

/**
 * Paystack sends the parent's browser here after checkout. This is NOT
 * trusted as proof of payment on its own — confirmPaystackPayment() always
 * re-verifies directly with Paystack before anything is marked successful.
 */
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  const redirectUrl = new URL("/dashboard/parent/fees", request.url);

  if (!reference) {
    redirectUrl.searchParams.set("error", "Missing payment reference");
    return NextResponse.redirect(redirectUrl);
  }

  const result = await confirmPaystackPayment(reference);

  if (result.ok) {
    redirectUrl.searchParams.set("success", "Payment confirmed");
  } else {
    redirectUrl.searchParams.set(
      "error",
      "We could not confirm this payment. If you were charged, contact the school office with your reference.",
    );
  }

  return NextResponse.redirect(redirectUrl);
}
