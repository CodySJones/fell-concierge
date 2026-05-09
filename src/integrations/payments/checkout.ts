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
      :root {
        --bg: #f2ebe1;
        --paper: #fffaf3;
        --ink: #1d1a17;
        --muted: #676058;
        --line: #d9cfc3;
        --serif-display: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Baskerville, Georgia, serif;
        --sans-quiet: "Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      }
      * { box-sizing: border-box; }
      body { margin:0; font-family:var(--sans-quiet); background:var(--bg); color:var(--ink); -webkit-font-smoothing: antialiased; }
      main { width:min(760px, calc(100vw - 48px)); min-height:100svh; margin:0 auto; padding:28px 0 64px; display:grid; align-content:center; }
      .brand { width:146px; max-width:38vw; display:block; margin-bottom: clamp(42px, 8vw, 86px); opacity:0.96; mix-blend-mode:multiply; }
      .card { background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:clamp(24px, 5vw, 38px); display:grid; gap:16px; }
      .pill { display:inline-flex; width:fit-content; color:var(--muted); font-size:11px; text-transform:uppercase; letter-spacing:0; }
      h1 { margin:0; font-family:var(--serif-display); font-size:clamp(2.4rem, 7vw, 4.2rem); line-height:1; font-weight:400; letter-spacing:0; }
      p { margin:0; color:var(--muted); font-size:16px; line-height:1.7; }
      strong { color:var(--ink); font-weight:600; }
      button { width:100%; padding:13px 16px; border:none; border-radius:8px; background:var(--ink); color:var(--bg); font-family:var(--sans-quiet); font-size:12px; text-transform:uppercase; letter-spacing:0; cursor:pointer; }
      .ghost { background:#ece5dc; color:var(--ink); }
      .toolbar { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:12px; margin-top:8px; }
      .toolbar a { text-decoration:none; }
      .note { color:var(--muted); }
      @media (max-width: 560px) { .toolbar { grid-template-columns:1fr; } }
    </style>
  </head>
  <body>
    <main>
      <img class="brand" src="/assets/fell-co-brand.svg" alt="Fell & Co" />
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
