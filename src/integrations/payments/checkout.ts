import { createHmac } from "node:crypto";
import type { ClientBundle, ProductType } from "../../types.ts";
import { PRODUCT_LABELS, PRICING, isFullPlansEligible } from "../../core/fallon/serviceCatalog.ts";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const paymentProvider = process.env.PAYMENT_PROVIDER ?? "mock";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const paymentSecret = process.env.SESSION_SECRET ?? "change-me-for-production";

export interface CheckoutRequest {
  clientId: string;
  productType: ProductType;
  returnPath: string;
}

export interface CheckoutSessionResult {
  provider: "mock" | "stripe";
  checkoutUrl: string;
  message: string;
}

interface PaymentTokenPayload {
  clientId: string;
  productType: ProductType;
  amount: number;
  returnPath: string;
}

const sign = (payload: string) => createHmac("sha256", paymentSecret).update(payload).digest("base64url");

const encodePayload = (payload: PaymentTokenPayload) => {
  const json = JSON.stringify(payload);
  return `${Buffer.from(json, "utf8").toString("base64url")}.${sign(json)}`;
};

export const decodePaymentToken = (token: string): PaymentTokenPayload | null => {
  const [payloadToken, signature] = token.split(".");
  if (!payloadToken || !signature) {
    return null;
  }
  const json = Buffer.from(payloadToken, "base64url").toString("utf8");
  const expectedSignature = sign(json);
  if (signature.length !== expectedSignature.length || signature !== expectedSignature) {
    return null;
  }
  return JSON.parse(json) as PaymentTokenPayload;
};

export const getAllowedCheckoutProducts = (): ProductType[] => [
  "SAMPLE_BOX",
  "CONSULTATION_1_HOUR",
  "LOCKIN_RENDER",
  "LOCKIN_RENDER_FLOORPLAN_CHANGE",
  "REVISIONS",
  "SELECTIONS_LIST",
  "FULL_PLANS_BUNDLE",
  "SAMPLE_BID"
];

export const validateCheckoutRequest = (bundle: ClientBundle, productType: ProductType) => {
  const allowedProducts = getAllowedCheckoutProducts();
  if (!allowedProducts.includes(productType)) {
    return { ok: false, error: "This product is not available through checkout in the MVP." };
  }

  const price = PRICING[productType];
  if (price == null || price <= 0) {
    return { ok: false, error: "This product does not have a fixed checkout price." };
  }

  if (productType === "FULL_PLANS_BUNDLE" && !isFullPlansEligible(bundle.purchases)) {
    return { ok: false, error: "Full plans are only available after the sample box and at least one qualifying paid design service." };
  }

  if ((productType === "LOCKIN_RENDER" || productType === "LOCKIN_RENDER_FLOORPLAN_CHANGE") && bundle.project?.scan_status !== "RECEIVED") {
    return { ok: false, error: "Lock-in render checkout is blocked until scan information is received." };
  }

  return { ok: true as const, amount: price };
};

const buildMockCheckoutUrl = (request: CheckoutRequest, amount: number) => {
  const token = encodePayload({
    clientId: request.clientId,
    productType: request.productType,
    amount,
    returnPath: request.returnPath
  });
  return `${baseUrl}/checkout/mock?token=${encodeURIComponent(token)}`;
};

const buildStripeCheckoutUrl = async (request: CheckoutRequest, amount: number) => {
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${baseUrl}/payment/success?clientId=${encodeURIComponent(request.clientId)}&productType=${encodeURIComponent(request.productType)}&returnPath=${encodeURIComponent(request.returnPath)}`);
  params.set("cancel_url", `${baseUrl}${request.returnPath}?checkout=cancelled`);
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][unit_amount]", String(Math.round(amount * 100)));
  params.set("line_items[0][price_data][product_data][name]", PRODUCT_LABELS[request.productType]);
  params.set("line_items[0][quantity]", "1");
  params.set("metadata[clientId]", request.clientId);
  params.set("metadata[productType]", request.productType);

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stripe checkout session failed: ${errorText}`);
  }

  const session = (await response.json()) as { url?: string };
  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }
  return session.url;
};

export const createCheckoutSession = async (bundle: ClientBundle, request: CheckoutRequest): Promise<CheckoutSessionResult> => {
  const validation = validateCheckoutRequest(bundle, request.productType);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  if (paymentProvider === "stripe" && stripeSecretKey) {
    return {
      provider: "stripe",
      checkoutUrl: await buildStripeCheckoutUrl(request, validation.amount),
      message: "Stripe checkout session created."
    };
  }

  return {
    provider: "mock",
    checkoutUrl: buildMockCheckoutUrl(request, validation.amount),
    message: "Mock checkout session created."
  };
};

export const renderMockCheckoutPage = (bundle: ClientBundle, token: string, amount: number, productType: ProductType) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Mock Checkout</title>
    <style>
      body { margin:0; font-family: Georgia, serif; background:#f5efe7; color:#1f1b18; }
      main { max-width:760px; margin:40px auto; padding:0 20px; }
      .card { background:#fffdf8; border:1px solid #ded3c6; border-radius:24px; padding:28px; box-shadow:0 20px 50px rgba(38,28,18,0.08); display:grid; gap:16px; }
      .pill { display:inline-block; padding:8px 12px; border-radius:999px; background:#efe3d8; color:#6e655d; font-size:12px; text-transform:uppercase; letter-spacing:0.08em; }
      button { padding:12px 16px; border:none; border-radius:14px; background:#1f1b18; color:white; font-size:16px; cursor:pointer; }
      .ghost { background:#ece5dc; color:#1f1b18; }
      .toolbar { display:flex; gap:12px; flex-wrap:wrap; }
      .note { color:#6e655d; }
    </style>
  </head>
  <body>
    <main>
      <div class="card">
        <span class="pill">Mock Payment Flow</span>
        <h1>${PRODUCT_LABELS[productType]}</h1>
        <p>Client: <strong>${bundle.client.name}</strong></p>
        <p>Amount due: <strong>$${amount}</strong></p>
        <p class="note">This mock checkout exists so the MVP can demonstrate a real payment step locally without pretending funds actually moved.</p>
        <div class="toolbar">
          <form method="POST" action="/checkout/mock/complete">
            <input type="hidden" name="token" value="${token}" />
            <button type="submit">Confirm Mock Payment</button>
          </form>
          <a href="${baseUrl}/portal?id=${bundle.client.id}"><button type="button" class="ghost">Cancel</button></a>
        </div>
      </div>
    </main>
  </body>
</html>`;

export const verifyStripeWebhook = async (rawBody: string, stripeSignatureHeader: string | undefined) => {
  if (!stripeWebhookSecret || !stripeSignatureHeader) {
    return false;
  }

  const parts = Object.fromEntries(
    stripeSignatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) {
    return false;
  }

  const payload = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", stripeWebhookSecret).update(payload).digest("hex");
  return expected.length === signature.length && expected === signature;
};

export const getPaymentProviderLabel = () => (paymentProvider === "stripe" && stripeSecretKey ? "Stripe" : "Mock checkout");
