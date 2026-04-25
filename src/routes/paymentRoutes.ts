import { getClientBundle, saveState } from "../data/runtimeStore.ts";
import { isAdminAuthenticated } from "../services/auth.ts";
import { createCheckoutSession, decodePaymentToken, verifyStripeWebhook } from "../integrations/payments/checkout.ts";
import { PRODUCT_LABELS } from "../core/fallon/serviceCatalog.ts";
import { parseBody, parseFormBody, parseRawBody, send, sendJson } from "../lib/http.ts";
import { recordPaidPurchase, refreshBundle, sendStageEmails } from "../core/app/clientBundles.ts";
import type { ProductType } from "../types.ts";
import type { RouteHandler } from "./routeContext.ts";

export const handlePaymentRoutes: RouteHandler = async ({ request, response, url, state }) => {
  if (request.method === "GET" && url.pathname === "/payment/success") {
    const clientId = url.searchParams.get("clientId");
    const productType = url.searchParams.get("productType") as ProductType | null;
    const returnPath = url.searchParams.get("returnPath") ?? (clientId ? `/portal?id=${clientId}` : "/");
    if (!clientId || !productType || !(productType in PRODUCT_LABELS)) {
      send(response, 400, "<h1>Missing payment confirmation details</h1>");
      return true;
    }
    recordPaidPurchase(state, clientId, productType);
    const bundle = refreshBundle(state, clientId);
    await sendStageEmails(state, bundle);
    saveState(state);
    response.writeHead(302, { Location: `${returnPath}${returnPath.includes("?") ? "&" : "?"}checkout=success` });
    response.end();
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/purchase") {
    if (!isAdminAuthenticated(request)) {
      sendJson(response, 401, { error: "Admin login required for manual purchase recording." });
      return true;
    }
    const body = await parseBody<{ clientId: string; productType: ProductType }>(request);
    if (!(body.productType in PRODUCT_LABELS)) {
      sendJson(response, 400, { error: "Unknown product type." });
      return true;
    }
    recordPaidPurchase(state, body.clientId, body.productType);
    const bundle = refreshBundle(state, body.clientId);
    await sendStageEmails(state, bundle);
    saveState(state);
    sendJson(response, 200, { message: `${PRODUCT_LABELS[body.productType]} recorded for ${bundle.client.name}.` });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/checkout/start") {
    const body = await parseBody<{ clientId: string; productType: ProductType; returnPath?: string }>(request);
    const bundle = getClientBundle(state, body.clientId);
    if (!bundle) {
      sendJson(response, 404, { error: "Client not found." });
      return true;
    }
    if (!(body.productType in PRODUCT_LABELS)) {
      sendJson(response, 400, { error: "Unknown product type." });
      return true;
    }
    const session = await createCheckoutSession(bundle, {
      clientId: body.clientId,
      productType: body.productType,
      returnPath: body.returnPath ?? `/portal?id=${body.clientId}`
    });
    sendJson(response, 200, {
      checkoutUrl: session.checkoutUrl,
      provider: session.provider,
      message: session.message
    });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/checkout/mock/complete") {
    const body = await parseFormBody(request);
    const token = body.token ?? "";
    const payload = decodePaymentToken(token);
    if (!payload) {
      send(response, 400, "<h1>Invalid payment token</h1>");
      return true;
    }
    recordPaidPurchase(state, payload.clientId, payload.productType);
    const bundle = refreshBundle(state, payload.clientId);
    await sendStageEmails(state, bundle);
    saveState(state);
    response.writeHead(302, {
      Location: `${payload.returnPath}${payload.returnPath.includes("?") ? "&" : "?"}checkout=success`
    });
    response.end();
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/payments/webhook") {
    const rawBody = await parseRawBody(request);
    const verified = await verifyStripeWebhook(rawBody, request.headers["stripe-signature"] as string | undefined);
    if (!verified) {
      sendJson(response, 400, { error: "Invalid Stripe signature." });
      return true;
    }
    const event = JSON.parse(rawBody) as {
      type?: string;
      data?: {
        object?: {
          metadata?: {
            clientId?: string;
            productType?: ProductType;
          };
        };
      };
    };
    const metadata = event.data?.object?.metadata;
    if (event.type === "checkout.session.completed" && metadata?.clientId && metadata?.productType && metadata.productType in PRODUCT_LABELS) {
      recordPaidPurchase(state, metadata.clientId, metadata.productType);
      const bundle = refreshBundle(state, metadata.clientId);
      await sendStageEmails(state, bundle);
      saveState(state);
    }
    sendJson(response, 200, { received: true });
    return true;
  }

  return false;
};
