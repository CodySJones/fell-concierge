import { resetState } from "../data/runtimeStore.ts";
import { authenticateAdmin, clearSessionCookie, createSessionCookie, isAdminAuthenticated, requireAdmin } from "../services/auth.ts";
import { buildAdminBundles, buildAdminMetrics } from "../core/app/clientBundles.ts";
import { parseFormBody, send, sendJson } from "../lib/http.ts";
import { renderAdminPage } from "../ui/adminPages.ts";
import { renderAgentPage } from "../ui/agentPages.ts";
import { renderAdminLoginPage } from "../ui/authPages.ts";
import type { RouteHandler } from "./routeContext.ts";

export const handleAdminRoutes: RouteHandler = async ({ request, response, url, state }) => {
  if (request.method === "GET" && url.pathname === "/admin/login") {
    if (isAdminAuthenticated(request)) {
      response.writeHead(302, { Location: "/admin" });
      response.end();
      return true;
    }
    const error = url.searchParams.get("error") === "1" ? "Invalid email or password." : "";
    send(response, 200, renderAdminLoginPage(error));
    return true;
  }

  if (request.method === "POST" && url.pathname === "/admin/login") {
    const body = await parseFormBody(request);
    const success = authenticateAdmin(body.email ?? "", body.password ?? "");
    if (!success) {
      response.writeHead(302, { Location: "/admin/login?error=1" });
      response.end();
      return true;
    }
    response.writeHead(302, {
      Location: "/admin",
      "Set-Cookie": createSessionCookie(body.email ?? "")
    });
    response.end();
    return true;
  }

  if (request.method === "GET" && url.pathname === "/admin/logout") {
    response.writeHead(302, {
      Location: "/admin/login",
      "Set-Cookie": clearSessionCookie()
    });
    response.end();
    return true;
  }

  if (request.method === "GET" && url.pathname === "/admin") {
    if (!requireAdmin(request, response)) {
      return true;
    }
    const bundles = buildAdminBundles(state);
    send(response, 200, renderAdminPage(state, bundles, buildAdminMetrics(state, bundles)));
    return true;
  }

  if (request.method === "GET" && url.pathname === "/admin/agent") {
    if (!requireAdmin(request, response)) {
      return true;
    }
    send(response, 200, renderAgentPage(state, buildAdminBundles(state)));
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/reset") {
    if (!isAdminAuthenticated(request)) {
      sendJson(response, 401, { error: "Admin login required." });
      return true;
    }
    resetState();
    sendJson(response, 200, { message: "Demo data reset." });
    return true;
  }

  return false;
};
