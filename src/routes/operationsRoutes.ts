import { randomUUID } from "node:crypto";
import { getClientBundle, saveState } from "../data/runtimeStore.ts";
import { isAdminAuthenticated } from "../services/auth.ts";
import { sendTemplatedEmail } from "../integrations/email/delivery.ts";
import { generateConsultBrief, generateSampleBox } from "../core/app/fulfillmentArtifacts.ts";
import { getFallonAgentSnapshot, runFallonAgentForClient } from "../core/fallon/agentRuntime.ts";
import { parseBody, sendJson } from "../lib/http.ts";
import { refreshBundle } from "../core/app/clientBundles.ts";
import type { RouteHandler } from "./routeContext.ts";

export const handleOperationsRoutes: RouteHandler = async ({ request, response, url, state }) => {
  if (request.method === "GET" && url.pathname === "/api/agent/status") {
    if (!isAdminAuthenticated(request)) {
      sendJson(response, 401, { error: "Admin login required." });
      return true;
    }
    sendJson(response, 200, getFallonAgentSnapshot(state));
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/agent/run") {
    if (!isAdminAuthenticated(request)) {
      sendJson(response, 401, { error: "Admin login required." });
      return true;
    }
    const body = await parseBody<{ clientId: string }>(request);
    const run = runFallonAgentForClient(state, body.clientId);
    saveState(state);
    if (run.status === "FAILED") {
      sendJson(response, 404, { error: run.error_message, run });
      return true;
    }
    sendJson(response, 200, {
      message: "Fallon agent briefing generated.",
      run
    });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/generate/sample-box") {
    if (!isAdminAuthenticated(request)) {
      sendJson(response, 401, { error: "Admin login required." });
      return true;
    }
    const body = await parseBody<{ clientId: string }>(request);
    const bundle = getClientBundle(state, body.clientId);
    if (!bundle) {
      sendJson(response, 404, { error: "Client not found." });
      return true;
    }
    state.sampleBoxItems = state.sampleBoxItems.filter((item) => item.client_id !== body.clientId);
    state.sampleBoxItems.push(...generateSampleBox(bundle));
    state.deliverables.push({
      id: randomUUID(),
      client_id: body.clientId,
      deliverable_type: "SAMPLE_BOX_PREP",
      status: "READY",
      generated_at: new Date().toISOString()
    });
    refreshBundle(state, body.clientId);
    saveState(state);
    sendJson(response, 200, { message: "Sample-box packing list generated." });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/generate/consult-brief") {
    if (!isAdminAuthenticated(request)) {
      sendJson(response, 401, { error: "Admin login required." });
      return true;
    }
    const body = await parseBody<{ clientId: string }>(request);
    const bundle = getClientBundle(state, body.clientId);
    if (!bundle) {
      sendJson(response, 404, { error: "Client not found." });
      return true;
    }
    state.consultBriefs = state.consultBriefs.filter((entry) => entry.client_id !== body.clientId);
    state.consultBriefs.push(generateConsultBrief(bundle));
    state.deliverables.push({
      id: randomUUID(),
      client_id: body.clientId,
      deliverable_type: "CONSULT_BRIEF",
      status: "READY",
      generated_at: new Date().toISOString()
    });
    refreshBundle(state, body.clientId);
    saveState(state);
    sendJson(response, 200, { message: "Consult brief generated." });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/email/send") {
    if (!isAdminAuthenticated(request)) {
      sendJson(response, 401, { error: "Admin login required." });
      return true;
    }
    const body = await parseBody<{ clientId: string; templateType: "PROFILE_RESULT" | "SAMPLE_BOX_REMINDER" | "OFFER_FOLLOWUP" }>(request);
    const bundle = getClientBundle(state, body.clientId);
    if (!bundle) {
      sendJson(response, 404, { error: "Client not found." });
      return true;
    }
    const delivery = await sendTemplatedEmail(state, bundle, body.templateType);
    saveState(state);
    sendJson(response, 200, {
      message: `Email processed via ${delivery.provider}.`,
      status: delivery.status
    });
    return true;
  }

  return false;
};
