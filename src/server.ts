import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { extname, join } from "node:path";
import { URL } from "node:url";
import { getClientBundle, loadState, resetState, saveState } from "./data/runtimeStore.ts";
import { initialState } from "./data/seed.ts";
import { ensureDefaultAdmin, authenticateAdmin, clearSessionCookie, createSessionCookie, isAdminAuthenticated, requireAdmin } from "./services/auth.ts";
import { getEmailProviderLabel, getEmailTemplatesForStage, sendTemplatedEmail } from "./services/emailDelivery.ts";
import { generateConsultBrief, generateSampleBox } from "./services/generators.ts";
import { saveUploadedFile, syncProjectReadinessFromUploads } from "./services/intakeUploads.ts";
import { createCheckoutSession, decodePaymentToken, getPaymentProviderLabel, renderMockCheckoutPage, verifyStripeWebhook } from "./services/payments.ts";
import { PRODUCT_LABELS, PRICING } from "./services/pricing.ts";
import { quizQuestions, scoreQuiz } from "./services/quizEngine.ts";
import { buildRecommendation, describeEligibility } from "./services/recommendations.ts";
import { deriveClientState } from "./services/workflow.ts";
import type { AppState, ClientBundle, ProductType, QuizSubmission } from "./types.ts";
import { renderAdminPage } from "./ui/adminPages.ts";
import { renderAdminLoginPage } from "./ui/authPages.ts";
import { renderPortalPage } from "./ui/portalPages.ts";
import { renderHomePage, renderResultPage, renderStartPage } from "./ui/publicPages.ts";

const port = Number(process.env.PORT ?? 3000);
const publicDir = join(process.cwd(), "public");
const defaultTypeformFormId = "01KPW0ZJQHA1W2WQATT9DVHRBK";
const typeformApiBaseUrl = process.env.TYPEFORM_API_BASE_URL ?? "https://api.typeform.com";
const typeformFormId = process.env.TYPEFORM_FORM_ID ?? defaultTypeformFormId;
const typeformWebhookTag = process.env.TYPEFORM_WEBHOOK_TAG ?? "fell-concierge";

type TypeformAnswer = {
  type?: string;
  field?: {
    id?: string;
    ref?: string;
    type?: string;
  };
  text?: string;
  email?: string;
  phone_number?: string;
  boolean?: boolean;
  number?: number;
  url?: string;
  choice?: {
    label?: string;
    ref?: string;
  };
  choices?: {
    labels?: string[];
  };
};

type TypeformWebhookPayload = {
  event_type?: string;
  form_response?: {
    form_id?: string;
    token?: string;
    submitted_at?: string;
    hidden?: Record<string, string>;
    answers?: TypeformAnswer[];
  };
};

const staticContentTypes: Record<string, string> = {
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".ico": "image/x-icon"
};

const send = (
  response: ServerResponse,
  statusCode: number,
  body: string,
  contentType = "text/html; charset=utf-8",
  headers: Record<string, string> = {}
) => {
  response.writeHead(statusCode, { "Content-Type": contentType, ...headers });
  response.end(body);
};

const sendJson = (response: ServerResponse, statusCode: number, payload: unknown, headers: Record<string, string> = {}) =>
  send(response, statusCode, JSON.stringify(payload), "application/json; charset=utf-8", headers);

const sendStaticFile = (response: ServerResponse, filePath: string) => {
  const extension = extname(filePath).toLowerCase();
  const contentType = staticContentTypes[extension] ?? "application/octet-stream";
  response.writeHead(200, { "Content-Type": contentType });
  createReadStream(filePath).pipe(response);
};

const parseBody = async (request: IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) {
    return {};
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const parseFormBody = async (request: IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Object.fromEntries(new URLSearchParams(Buffer.concat(chunks).toString("utf8")).entries());
};

const parseRawBody = async (request: IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
};

const normalizeValue = (value: string) => value.trim().toLowerCase();

const getTypeformSourceKey = (responseId: string) => `Typeform:${responseId}`;

const findClientIdByTypeformResponse = (state: AppState, responseId: string) =>
  state.clients.find((entry) => entry.source === getTypeformSourceKey(responseId))?.id ?? null;

const getTypeformAnswerValue = (answer: TypeformAnswer | undefined) => {
  if (!answer) {
    return "";
  }
  if (typeof answer.choice?.ref === "string" && answer.choice.ref) {
    return answer.choice.ref;
  }
  if (typeof answer.choice?.label === "string" && answer.choice.label) {
    return answer.choice.label;
  }
  if (Array.isArray(answer.choices?.labels) && answer.choices.labels.length > 0) {
    return answer.choices.labels.join(", ");
  }
  if (typeof answer.text === "string") {
    return answer.text;
  }
  if (typeof answer.email === "string") {
    return answer.email;
  }
  if (typeof answer.phone_number === "string") {
    return answer.phone_number;
  }
  if (typeof answer.url === "string") {
    return answer.url;
  }
  if (typeof answer.number === "number") {
    return String(answer.number);
  }
  if (typeof answer.boolean === "boolean") {
    return answer.boolean ? "Yes" : "No";
  }
  return "";
};

const getStringFromTypeformMap = (answerMap: Map<string, string>, refs: string[], fallback = "") => {
  for (const ref of refs) {
    const value = answerMap.get(ref);
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return fallback;
};

const buildQuizAnswersFromTypeformMap = (answerMap: Map<string, string>) =>
  quizQuestions.flatMap((question) => {
    const rawValue = answerMap.get(question.id);
    if (!rawValue) {
      return [];
    }
    const normalized = normalizeValue(rawValue);
    const match = question.options.find((option) => normalizeValue(option.value) === normalized || normalizeValue(option.label) === normalized);
    return match ? [`${question.id}:${match.value}`] : [];
  });

const buildQuizSubmissionFromTypeformPayload = (payload: TypeformWebhookPayload): QuizSubmission => {
  const answers = payload.form_response?.answers ?? [];
  const hidden = payload.form_response?.hidden ?? {};
  const answerMap = new Map<string, string>();

  for (const [key, value] of Object.entries(hidden)) {
    if (typeof value === "string" && value.trim()) {
      answerMap.set(key, value.trim());
    }
  }

  for (const answer of answers) {
    const ref = answer.field?.ref;
    if (!ref) {
      continue;
    }
    const value = getTypeformAnswerValue(answer);
    if (value) {
      answerMap.set(ref, value);
    }
  }

  const quizAnswers = buildQuizAnswersFromTypeformMap(answerMap);
  if (quizAnswers.length < quizQuestions.length) {
    throw new Error("Typeform submission is missing one or more quiz answers. Make sure the Typeform field refs match the app quiz ids.");
  }

  return {
    name: getStringFromTypeformMap(answerMap, ["name", "full_name"], "Fell & Co Lead"),
    email: getStringFromTypeformMap(answerMap, ["email"], "unknown@fell-co.com"),
    phone: getStringFromTypeformMap(answerMap, ["phone", "phone_number"], "Not provided"),
    projectAddress: getStringFromTypeformMap(answerMap, ["projectAddress", "project_address", "address"], "To be confirmed"),
    roomType: getStringFromTypeformMap(answerMap, ["roomType", "room_type"], "Bathroom"),
    scopeNotes: getStringFromTypeformMap(answerMap, ["scopeNotes", "scope_notes"], "Collected via Typeform."),
    budgetRange: getStringFromTypeformMap(answerMap, ["budgetRange", "budget_range"], "To be confirmed"),
    contractorStatus: getStringFromTypeformMap(answerMap, ["contractorStatus", "contractor_status"], "Unknown"),
    timeline: getStringFromTypeformMap(answerMap, ["timeline"], "To be confirmed"),
    source: getStringFromTypeformMap(answerMap, ["source"], "Typeform"),
    answers: quizAnswers
  };
};

const createClientFromQuizSubmission = async (state: AppState, body: QuizSubmission, sourceOverride?: string) => {
  const clientId = randomUUID();
  const projectId = randomUUID();
  const profileId = randomUUID();
  const quizResult = scoreQuiz(body);

  state.clients.push({
    id: clientId,
    name: body.name,
    email: body.email,
    phone: body.phone,
    project_address: body.projectAddress,
    source: sourceOverride ?? body.source ?? "Website",
    current_state: "LEAD_CAPTURED",
    created_at: new Date().toISOString()
  });

  state.projects.push({
    id: projectId,
    client_id: clientId,
    room_type: body.roomType,
    scope_notes: body.scopeNotes,
    budget_range: body.budgetRange,
    contractor_status: body.contractorStatus,
    timeline: body.timeline,
    scan_status: "NOT_REQUESTED",
    measurements_status: "MISSING"
  });

  state.designProfileResults.push({
    id: profileId,
    client_id: clientId,
    primary_profile: quizResult.primaryProfile,
    primary_confidence: quizResult.primaryConfidence,
    secondary_profile: quizResult.secondaryProfile,
    secondary_confidence: quizResult.secondaryConfidence,
    rationale: quizResult.rationale
  });

  const refreshedBundle = refreshBundle(state, clientId);
  await sendTemplatedEmail(state, refreshedBundle, "PROFILE_RESULT");
  saveState(state);
  return clientId;
};

const fetchTypeformResponse = async (formId: string, responseId: string) => {
  const token = process.env.TYPEFORM_API_TOKEN;
  if (!token) {
    throw new Error("TYPEFORM_API_TOKEN is required for fallback response syncing.");
  }
  const endpoint = new URL(`${typeformApiBaseUrl.replace(/\/$/, "")}/forms/${encodeURIComponent(formId)}/responses`);
  endpoint.searchParams.set("included_response_ids", responseId);

  const typeformResponse = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!typeformResponse.ok) {
    throw new Error(`Typeform response lookup failed with ${typeformResponse.status}.`);
  }

  const payload = await typeformResponse.json() as { items?: Array<TypeformWebhookPayload["form_response"]> };
  const formResponse = payload.items?.[0];
  if (!formResponse) {
    throw new Error("Typeform response not available yet.");
  }

  return {
    event_type: "form_response",
    form_response: formResponse
  } satisfies TypeformWebhookPayload;
};

const verifyTypeformWebhookSignature = (rawBody: string, signatureHeader: string | undefined) => {
  const secret = process.env.TYPEFORM_WEBHOOK_SECRET;
  if (!secret) {
    return true;
  }
  if (!signatureHeader?.startsWith("sha256=")) {
    return false;
  }
  const expected = Buffer.from(`sha256=${createHmac("sha256", secret).update(rawBody).digest("base64")}`);
  const actual = Buffer.from(signatureHeader);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

const syncTypeformPayloadToClient = async (state: AppState, payload: TypeformWebhookPayload) => {
  const responseId = payload.form_response?.token;
  if (!responseId) {
    throw new Error("Typeform payload is missing a response token.");
  }

  const existingClientId = findClientIdByTypeformResponse(state, responseId);
  if (existingClientId) {
    return existingClientId;
  }

  const submission = buildQuizSubmissionFromTypeformPayload(payload);
  return createClientFromQuizSubmission(state, submission, getTypeformSourceKey(responseId));
};

const registerTypeformWebhook = async () => {
  const token = process.env.TYPEFORM_API_TOKEN;
  const baseUrl = process.env.BASE_URL;
  if (!token || !baseUrl || /localhost|127\.0\.0\.1/.test(baseUrl)) {
    return;
  }

  const endpoint = `${typeformApiBaseUrl.replace(/\/$/, "")}/forms/${encodeURIComponent(typeformFormId)}/webhooks/${encodeURIComponent(typeformWebhookTag)}`;
  const webhookUrl = `${baseUrl.replace(/\/$/, "")}/api/typeform/webhook`;

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      enabled: true,
      verify_ssl: true,
      url: webhookUrl,
      secret: process.env.TYPEFORM_WEBHOOK_SECRET || undefined,
      event_types: {
        form_response: true
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Typeform webhook upsert failed: ${response.status} ${errorText}`);
  }
};

const recordPaidPurchase = (state: AppState, clientId: string, productType: ProductType) => {
  const existing = state.purchases.find((purchase) => purchase.client_id === clientId && purchase.product_type === productType && purchase.status === "PAID");
  if (existing) {
    return existing;
  }
  const amount = PRICING[productType] ?? 0;
  const purchase = {
    id: randomUUID(),
    client_id: clientId,
    product_type: productType,
    amount,
    status: "PAID" as const,
    purchased_at: new Date().toISOString()
  };
  state.purchases.push(purchase);
  return purchase;
};

const refreshBundle = (state: AppState, clientId: string): ClientBundle => {
  const bundle = getClientBundle(state, clientId);
  if (!bundle) {
    throw new Error("Client not found");
  }
  syncProjectReadinessFromUploads(bundle);
  const recommendationDetail = buildRecommendation(bundle);
  state.offerRecommendations = state.offerRecommendations.filter((entry) => entry.client_id !== clientId);
  state.offerRecommendations.push(recommendationDetail.recommendation);
  const updatedBundle = getClientBundle(state, clientId)!;
  syncProjectReadinessFromUploads(updatedBundle);
  updatedBundle.client.current_state = deriveClientState(updatedBundle);
  return updatedBundle;
};

const metrics = (state: AppState, bundles: ClientBundle[]) => ({
  leads: state.clients.length,
  sampleBoxes: state.purchases.filter((purchase) => purchase.product_type === "SAMPLE_BOX" && purchase.status === "PAID").length,
  consultations: state.purchases.filter((purchase) => purchase.product_type === "CONSULTATION_1_HOUR" && purchase.status === "PAID").length,
  fullPlansEligible: bundles.filter((bundle) => describeEligibility(bundle).fullPlansEligible).length
});

if (process.env.DEMO_RESET === "true") {
  resetState();
} else {
  const state = loadState();
  if (state.clients.length === 0) {
    saveState(initialState());
  }
}

ensureDefaultAdmin();

void registerTypeformWebhook().catch((error) => {
  console.error("Typeform webhook registration skipped:", error instanceof Error ? error.message : error);
});

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const state = loadState();

  try {
    if (request.method === "GET" && (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/site/"))) {
      const assetName = url.pathname.replace(/^\/(assets|site)\//, "");
      const folder = url.pathname.startsWith("/site/") ? "site" : "";
      const assetPath = folder ? join(publicDir, folder, assetName) : join(publicDir, assetName);
      if (!existsSync(assetPath)) {
        return send(response, 404, "<h1>Asset not found</h1>");
      }
      return sendStaticFile(response, assetPath);
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return sendJson(response, 200, {
        ok: true,
        app: "Fell Concierge",
        paymentProvider: getPaymentProviderLabel(),
        emailProvider: getEmailProviderLabel(),
        timestamp: new Date().toISOString()
      });
    }

    if (request.method === "GET" && url.pathname === "/") {
      return send(response, 200, renderHomePage());
    }

    if (request.method === "GET" && url.pathname === "/start") {
      return send(response, 200, renderStartPage());
    }

    if (request.method === "GET" && url.pathname === "/result") {
      const clientId = url.searchParams.get("id");
      const bundle = clientId ? getClientBundle(state, clientId) : undefined;
      if (!bundle) {
        return send(response, 404, "<h1>Client not found</h1>");
      }
      return send(response, 200, renderResultPage(bundle));
    }

    if (request.method === "GET" && url.pathname === "/portal") {
      const clientId = url.searchParams.get("id");
      const bundle = clientId ? getClientBundle(state, clientId) : undefined;
      if (!bundle) {
        return send(response, 404, "<h1>Client not found</h1>");
      }
      return send(response, 200, renderPortalPage(bundle, isAdminAuthenticated(request)));
    }

    if (request.method === "GET" && url.pathname === "/checkout/mock") {
      const token = url.searchParams.get("token");
      const payload = token ? decodePaymentToken(token) : null;
      if (!token || !payload) {
        return send(response, 400, "<h1>Invalid checkout token</h1>");
      }
      const bundle = getClientBundle(state, payload.clientId);
      if (!bundle) {
        return send(response, 404, "<h1>Client not found</h1>");
      }
      return send(response, 200, renderMockCheckoutPage(bundle, token, payload.amount, payload.productType));
    }

    if (request.method === "GET" && url.pathname === "/payment/success") {
      const clientId = url.searchParams.get("clientId");
      const productType = url.searchParams.get("productType") as ProductType | null;
      const returnPath = url.searchParams.get("returnPath") ?? (clientId ? `/portal?id=${clientId}` : "/");
      if (!clientId || !productType || !(productType in PRODUCT_LABELS)) {
        return send(response, 400, "<h1>Missing payment confirmation details</h1>");
      }
      recordPaidPurchase(state, clientId, productType);
      const bundle = refreshBundle(state, clientId);
      for (const templateType of getEmailTemplatesForStage(bundle)) {
        await sendTemplatedEmail(state, bundle, templateType);
      }
      saveState(state);
      response.writeHead(302, { Location: `${returnPath}${returnPath.includes("?") ? "&" : "?"}checkout=success` });
      response.end();
      return;
    }

    if (request.method === "GET" && url.pathname === "/admin/login") {
      if (isAdminAuthenticated(request)) {
        response.writeHead(302, { Location: "/admin" });
        response.end();
        return;
      }
      const error = url.searchParams.get("error") === "1" ? "Invalid email or password." : "";
      return send(response, 200, renderAdminLoginPage(error));
    }

    if (request.method === "POST" && url.pathname === "/admin/login") {
      const body = await parseFormBody(request);
      const success = authenticateAdmin(body.email ?? "", body.password ?? "");
      if (!success) {
        response.writeHead(302, { Location: "/admin/login?error=1" });
        response.end();
        return;
      }
      response.writeHead(302, {
        Location: "/admin",
        "Set-Cookie": createSessionCookie(body.email ?? "")
      });
      response.end();
      return;
    }

    if (request.method === "GET" && url.pathname === "/admin/logout") {
      response.writeHead(302, {
        Location: "/admin/login",
        "Set-Cookie": clearSessionCookie()
      });
      response.end();
      return;
    }

    if (request.method === "GET" && url.pathname === "/admin") {
      if (!requireAdmin(request, response)) {
        return;
      }
      const bundles = state.clients.map((client) => getClientBundle(state, client.id)!).map((bundle) => ({
        ...bundle,
        recommendation: buildRecommendation(bundle).recommendation
      }));
      return send(response, 200, renderAdminPage(state, bundles, metrics(state, bundles)));
    }

    if (request.method === "POST" && url.pathname === "/api/quiz") {
      const body = (await parseBody(request)) as QuizSubmission;
      const clientId = await createClientFromQuizSubmission(state, body);
      return sendJson(response, 200, { clientId });
    }

    if (request.method === "GET" && url.pathname === "/api/typeform/status") {
      const responseId = url.searchParams.get("responseId");
      if (!responseId) {
        return sendJson(response, 400, { error: "responseId is required." });
      }
      const clientId = findClientIdByTypeformResponse(state, responseId);
      return sendJson(response, 200, { ready: Boolean(clientId), clientId });
    }

    if (request.method === "POST" && url.pathname === "/api/typeform/complete") {
      const body = (await parseBody(request)) as { responseId?: string; formId?: string };
      const responseId = body.responseId?.trim();
      const formId = body.formId?.trim() || typeformFormId;
      if (!responseId) {
        return sendJson(response, 400, { error: "responseId is required." });
      }

      const existingClientId = findClientIdByTypeformResponse(state, responseId);
      if (existingClientId) {
        return sendJson(response, 200, { clientId: existingClientId, source: "existing" });
      }

      try {
        const payload = await fetchTypeformResponse(formId, responseId);
        const clientId = await syncTypeformPayloadToClient(state, payload);
        return sendJson(response, 200, { clientId, source: "responses_api" });
      } catch (error) {
        return sendJson(response, 202, { pending: true, error: error instanceof Error ? error.message : "Typeform sync pending." });
      }
    }

    if (request.method === "POST" && url.pathname === "/api/typeform/webhook") {
      const rawBody = await parseRawBody(request);
      if (!verifyTypeformWebhookSignature(rawBody, request.headers["typeform-signature"] as string | undefined)) {
        return sendJson(response, 401, { error: "Invalid Typeform signature." });
      }

      const payload = JSON.parse(rawBody) as TypeformWebhookPayload;
      if (payload.event_type !== "form_response" || !payload.form_response?.token) {
        return sendJson(response, 200, { received: true, ignored: true });
      }

      const clientId = await syncTypeformPayloadToClient(state, payload);
      return sendJson(response, 200, { received: true, clientId });
    }

    if (request.method === "POST" && url.pathname === "/api/purchase") {
      if (!isAdminAuthenticated(request)) {
        return sendJson(response, 401, { error: "Admin login required for manual purchase recording." });
      }
      const body = (await parseBody(request)) as { clientId: string; productType: ProductType };
      if (!(body.productType in PRODUCT_LABELS)) {
        return sendJson(response, 400, { error: "Unknown product type." });
      }
      recordPaidPurchase(state, body.clientId, body.productType);
      const bundle = refreshBundle(state, body.clientId);
      for (const templateType of getEmailTemplatesForStage(bundle)) {
        await sendTemplatedEmail(state, bundle, templateType);
      }
      saveState(state);
      return sendJson(response, 200, { message: `${PRODUCT_LABELS[body.productType]} recorded for ${bundle.client.name}.` });
    }

    if (request.method === "POST" && url.pathname === "/api/checkout/start") {
      const body = (await parseBody(request)) as { clientId: string; productType: ProductType; returnPath?: string };
      const bundle = getClientBundle(state, body.clientId);
      if (!bundle) {
        return sendJson(response, 404, { error: "Client not found." });
      }
      if (!(body.productType in PRODUCT_LABELS)) {
        return sendJson(response, 400, { error: "Unknown product type." });
      }
      const session = await createCheckoutSession(bundle, {
        clientId: body.clientId,
        productType: body.productType,
        returnPath: body.returnPath ?? `/portal?id=${body.clientId}`
      });
      return sendJson(response, 200, {
        checkoutUrl: session.checkoutUrl,
        provider: session.provider,
        message: session.message
      });
    }

    if (request.method === "POST" && url.pathname === "/api/project/update") {
      const body = (await parseBody(request)) as {
        clientId: string;
        scopeNotes: string;
      };
      const project = state.projects.find((entry) => entry.client_id === body.clientId);
      if (!project) {
        return sendJson(response, 404, { error: "Project not found." });
      }
      project.scope_notes = body.scopeNotes;
      refreshBundle(state, body.clientId);
      saveState(state);
      return sendJson(response, 200, { message: "Project intake updated." });
    }

    if (request.method === "POST" && url.pathname === "/api/intake/upload") {
      const body = (await parseBody(request)) as {
        clientId: string;
        intakeType: "SCAN_FILE" | "MEASUREMENTS_FILE" | "REFERENCE_FILE";
        originalName: string;
        mimeType: string;
        base64Data: string;
        note?: string;
      };
      const bundle = getClientBundle(state, body.clientId);
      if (!bundle) {
        return sendJson(response, 404, { error: "Client not found." });
      }
      if (!body.base64Data || !body.originalName) {
        return sendJson(response, 400, { error: "File data is required." });
      }
      const upload = saveUploadedFile(state, body);
      refreshBundle(state, body.clientId);
      saveState(state);
      return sendJson(response, 200, {
        message: `${upload.original_name} uploaded successfully.`,
        uploadId: upload.id
      });
    }

    if (request.method === "POST" && url.pathname === "/api/generate/sample-box") {
      if (!isAdminAuthenticated(request)) {
        return sendJson(response, 401, { error: "Admin login required." });
      }
      const body = (await parseBody(request)) as { clientId: string };
      const bundle = getClientBundle(state, body.clientId);
      if (!bundle) {
        return sendJson(response, 404, { error: "Client not found." });
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
      return sendJson(response, 200, { message: "Sample-box packing list generated." });
    }

    if (request.method === "POST" && url.pathname === "/api/generate/consult-brief") {
      if (!isAdminAuthenticated(request)) {
        return sendJson(response, 401, { error: "Admin login required." });
      }
      const body = (await parseBody(request)) as { clientId: string };
      const bundle = getClientBundle(state, body.clientId);
      if (!bundle) {
        return sendJson(response, 404, { error: "Client not found." });
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
      return sendJson(response, 200, { message: "Consult brief generated." });
    }

    if (request.method === "POST" && url.pathname === "/api/reset") {
      if (!isAdminAuthenticated(request)) {
        return sendJson(response, 401, { error: "Admin login required." });
      }
      resetState();
      return sendJson(response, 200, { message: "Demo data reset." });
    }

    if (request.method === "POST" && url.pathname === "/api/email/send") {
      if (!isAdminAuthenticated(request)) {
        return sendJson(response, 401, { error: "Admin login required." });
      }
      const body = (await parseBody(request)) as { clientId: string; templateType: "PROFILE_RESULT" | "SAMPLE_BOX_REMINDER" | "OFFER_FOLLOWUP" };
      const bundle = getClientBundle(state, body.clientId);
      if (!bundle) {
        return sendJson(response, 404, { error: "Client not found." });
      }
      const delivery = await sendTemplatedEmail(state, bundle, body.templateType);
      saveState(state);
      return sendJson(response, 200, {
        message: `Email processed via ${delivery.provider}.`,
        status: delivery.status
      });
    }

    if (request.method === "POST" && url.pathname === "/checkout/mock/complete") {
      const body = await parseFormBody(request);
      const token = body.token ?? "";
      const payload = decodePaymentToken(token);
      if (!payload) {
        return send(response, 400, "<h1>Invalid payment token</h1>");
      }
      recordPaidPurchase(state, payload.clientId, payload.productType);
      const bundle = refreshBundle(state, payload.clientId);
      for (const templateType of getEmailTemplatesForStage(bundle)) {
        await sendTemplatedEmail(state, bundle, templateType);
      }
      saveState(state);
      response.writeHead(302, {
        Location: `${payload.returnPath}${payload.returnPath.includes("?") ? "&" : "?"}checkout=success`
      });
      response.end();
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/payments/webhook") {
      const rawBody = await parseRawBody(request);
      const verified = await verifyStripeWebhook(rawBody, request.headers["stripe-signature"] as string | undefined);
      if (!verified) {
        return sendJson(response, 400, { error: "Invalid Stripe signature." });
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
        for (const templateType of getEmailTemplatesForStage(bundle)) {
          await sendTemplatedEmail(state, bundle, templateType);
        }
        saveState(state);
      }
      return sendJson(response, 200, { received: true });
    }

    return send(response, 404, "<h1>Not found</h1>");
  } catch (error) {
    return sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

server.listen(port, () => {
  console.log(`Fell Concierge running at http://localhost:${port} with ${getPaymentProviderLabel()} and email via ${getEmailProviderLabel()}`);
});
