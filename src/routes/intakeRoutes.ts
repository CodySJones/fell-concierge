import { saveState, getClientBundle } from "../data/runtimeStore.ts";
import { saveUploadedFile } from "../core/app/intakeUploads.ts";
import { createClientFromQuizSubmission, refreshBundle } from "../core/app/clientBundles.ts";
import { fetchTypeformResponse, findClientIdByTypeformResponse, syncTypeformPayloadToClient, typeformFormId, verifyTypeformWebhookSignature, type TypeformWebhookPayload } from "../integrations/typeform/client.ts";
import type { QuizSubmission } from "../types.ts";
import { parseBody, parseRawBody, sendJson } from "../lib/http.ts";
import type { RouteHandler } from "./routeContext.ts";

export const handleIntakeRoutes: RouteHandler = async ({ request, response, url, state }) => {
  if (request.method === "POST" && url.pathname === "/api/quiz") {
    const body = await parseBody<QuizSubmission>(request);
    const clientId = await createClientFromQuizSubmission(state, body);
    sendJson(response, 200, { clientId });
    return true;
  }

  if (request.method === "GET" && url.pathname === "/api/typeform/status") {
    const responseId = url.searchParams.get("responseId");
    if (!responseId) {
      sendJson(response, 400, { error: "responseId is required." });
      return true;
    }
    const clientId = findClientIdByTypeformResponse(state, responseId);
    sendJson(response, 200, { ready: Boolean(clientId), clientId });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/typeform/complete") {
    const body = await parseBody<{ responseId?: string; formId?: string }>(request);
    const responseId = body.responseId?.trim();
    const formId = body.formId?.trim() || typeformFormId;
    if (!responseId) {
      sendJson(response, 400, { error: "responseId is required." });
      return true;
    }

    const existingClientId = findClientIdByTypeformResponse(state, responseId);
    if (existingClientId) {
      sendJson(response, 200, { clientId: existingClientId, source: "existing" });
      return true;
    }

    try {
      const payload = await fetchTypeformResponse(formId, responseId);
      const clientId = await syncTypeformPayloadToClient(state, payload);
      sendJson(response, 200, { clientId, source: "responses_api" });
      return true;
    } catch (error) {
      sendJson(response, 202, { pending: true, error: error instanceof Error ? error.message : "Typeform sync pending." });
      return true;
    }
  }

  if (request.method === "POST" && url.pathname === "/api/typeform/webhook") {
    const rawBody = await parseRawBody(request);
    if (!verifyTypeformWebhookSignature(rawBody, request.headers["typeform-signature"] as string | undefined)) {
      sendJson(response, 401, { error: "Invalid Typeform signature." });
      return true;
    }

    const payload = JSON.parse(rawBody) as TypeformWebhookPayload;
    if (payload.event_type !== "form_response" || !payload.form_response?.token) {
      sendJson(response, 200, { received: true, ignored: true });
      return true;
    }

    const clientId = await syncTypeformPayloadToClient(state, payload);
    sendJson(response, 200, { received: true, clientId });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/project/update") {
    const body = await parseBody<{ clientId: string; scopeNotes: string }>(request);
    const project = state.projects.find((entry) => entry.client_id === body.clientId);
    if (!project) {
      sendJson(response, 404, { error: "Project not found." });
      return true;
    }
    project.scope_notes = body.scopeNotes;
    refreshBundle(state, body.clientId);
    saveState(state);
    sendJson(response, 200, { message: "Project intake updated." });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/intake/upload") {
    const body = await parseBody<{
      clientId: string;
      intakeType: "SCAN_FILE" | "MEASUREMENTS_FILE" | "REFERENCE_FILE";
      originalName: string;
      mimeType: string;
      base64Data: string;
      note?: string;
    }>(request);
    const bundle = getClientBundle(state, body.clientId);
    if (!bundle) {
      sendJson(response, 404, { error: "Client not found." });
      return true;
    }
    if (!body.base64Data || !body.originalName) {
      sendJson(response, 400, { error: "File data is required." });
      return true;
    }
    const upload = saveUploadedFile(state, body);
    refreshBundle(state, body.clientId);
    saveState(state);
    sendJson(response, 200, {
      message: `${upload.original_name} uploaded successfully.`,
      uploadId: upload.id
    });
    return true;
  }

  return false;
};
