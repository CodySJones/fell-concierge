import { existsSync } from "node:fs";
import { join } from "node:path";
import { getClientBundle } from "../data/runtimeStore.ts";
import { getFallonAgentSnapshot } from "../core/fallon/agentRuntime.ts";
import { getEmailProviderLabel } from "../integrations/email/delivery.ts";
import { getPaymentProviderLabel, renderMockCheckoutPage, decodePaymentToken } from "../integrations/payments/checkout.ts";
import { send, sendJson, sendStaticFile } from "../lib/http.ts";
import { renderPortalPage } from "../ui/portalPages.ts";
import { renderHomePage, renderPortalAccessPage, renderResultPage, renderStartPage } from "../ui/publicPages.ts";
import type { RouteHandler } from "./routeContext.ts";

const publicDir = join(process.cwd(), "public");

export const handlePublicRoutes: RouteHandler = async ({ request, response, url, state }) => {
  if (request.method === "GET" && (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/site/"))) {
    const assetName = url.pathname.replace(/^\/(assets|site)\//, "");
    const folder = url.pathname.startsWith("/site/") ? "site" : "";
    const assetPath = folder ? join(publicDir, folder, assetName) : join(publicDir, assetName);
    if (!existsSync(assetPath)) {
      send(response, 404, "<h1>Asset not found</h1>");
      return true;
    }
    sendStaticFile(response, assetPath);
    return true;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    const agent = getFallonAgentSnapshot(state);
    sendJson(response, 200, {
      ok: true,
      app: "Fell Concierge",
      paymentProvider: getPaymentProviderLabel(),
      emailProvider: getEmailProviderLabel(),
      agent: {
        status: agent.heartbeat.status,
        lastSeenAt: agent.heartbeat.last_seen_at,
        activeSkills: agent.skills.length,
        memoryCount: agent.memoryCount
      },
      timestamp: new Date().toISOString()
    });
    return true;
  }

  if (request.method === "GET" && url.pathname === "/") {
    send(response, 200, renderHomePage());
    return true;
  }

  if (request.method === "GET" && url.pathname === "/start") {
    send(response, 200, renderStartPage());
    return true;
  }

  if (request.method === "GET" && url.pathname === "/result") {
    const clientId = url.searchParams.get("id");
    const bundle = clientId ? getClientBundle(state, clientId) : undefined;
    if (!bundle) {
      send(response, 404, "<h1>Client not found</h1>");
      return true;
    }
    send(response, 200, renderResultPage(bundle));
    return true;
  }

  if (request.method === "GET" && url.pathname === "/portal") {
    const clientId = url.searchParams.get("id");
    const bundle = clientId ? getClientBundle(state, clientId) : undefined;
    if (!bundle) {
      if (!clientId) {
        send(response, 200, renderPortalAccessPage());
      } else {
        send(response, 404, renderPortalAccessPage());
      }
      return true;
    }
    send(response, 200, renderPortalPage(bundle));
    return true;
  }

  if (request.method === "GET" && url.pathname === "/checkout/mock") {
    const token = url.searchParams.get("token");
    const payload = token ? decodePaymentToken(token) : null;
    if (!token || !payload) {
      send(response, 400, "<h1>Invalid checkout token</h1>");
      return true;
    }
    const bundle = getClientBundle(state, payload.clientId);
    if (!bundle) {
      send(response, 404, "<h1>Client not found</h1>");
      return true;
    }
    send(response, 200, renderMockCheckoutPage(bundle, token, payload.amount, payload.productType));
    return true;
  }

  return false;
};
