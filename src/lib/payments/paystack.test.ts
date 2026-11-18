import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { verifyWebhookSignature } from "./paystack";

const originalKey = process.env.PAYSTACK_SECRET_KEY;

describe("verifyWebhookSignature", () => {
  beforeEach(() => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_fake_key_for_unit_tests";
  });

  afterEach(() => {
    process.env.PAYSTACK_SECRET_KEY = originalKey;
  });

  it("accepts a signature computed the same way Paystack computes it", async () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "abc123" } });
    const expectedSignature = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!).update(body).digest("hex");

    await expect(verifyWebhookSignature(body, expectedSignature)).resolves.toBe(true);
  });

  it("rejects a tampered body", async () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "abc123" } });
    const signatureForDifferentBody = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify({ event: "charge.success", data: { reference: "different" } }))
      .digest("hex");

    await expect(verifyWebhookSignature(body, signatureForDifferentBody)).resolves.toBe(false);
  });

  it("rejects a missing signature header", async () => {
    await expect(verifyWebhookSignature("{}", null)).resolves.toBe(false);
  });
});
