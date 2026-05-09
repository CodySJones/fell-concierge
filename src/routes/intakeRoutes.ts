import { saveState, getClientBundle } from "../data/runtimeStore.ts";
import { saveUploadedFile } from "../core/app/intakeUploads.ts";
import { createClientFromQuizSubmission, refreshBundle } from "../core/app/clientBundles.ts";
import type { QuizSubmission } from "../types.ts";
import { parseBody, sendJson } from "../lib/http.ts";
import type { RouteHandler } from "./routeContext.ts";

export const handleIntakeRoutes: RouteHandler = async ({ request, response, url, state }) => {
  if (request.method === "POST" && url.pathname === "/api/quiz") {
    const body = await parseBody<QuizSubmission>(request);
    const clientId = await createClientFromQuizSubmission(state, body);
    sendJson(response, 200, { clientId });
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
