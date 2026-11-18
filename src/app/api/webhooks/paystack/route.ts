import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/paystack";
import { confirmPaystackPayment } from "@/lib/payments/confirm";

/**
 * Server-to-server notification from Paystack. The signature check is what
 * proves this request actually came from Paystack — never process a webhook
 * body without it. The actual status is still re-verified independently via
 * confirmPaystackPayment(), never trusted straight from the payload.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  const valid = await verifyWebhookSignature(rawBody, signature);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const reference = event.data?.reference;
  if (event.event === "charge.success" && reference) {
    await confirmPaystackPayment(reference);
  }

  return NextResponse.json({ received: true });
}
