import { createHmac, timingSafeEqual } from "node:crypto";
import type { AppState, QuizSubmission } from "../../types.ts";
import { quizQuestions } from "../../core/fallon/profileEngine.ts";
import { createClientFromQuizSubmission } from "../../core/app/clientBundles.ts";

const defaultTypeformFormId = "01KPW0ZJQHA1W2WQATT9DVHRBK";
const typeformApiBaseUrl = process.env.TYPEFORM_API_BASE_URL ?? "https://api.typeform.com";
export const typeformFormId = process.env.TYPEFORM_FORM_ID ?? defaultTypeformFormId;
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

export type TypeformWebhookPayload = {
  event_type?: string;
  form_response?: {
    form_id?: string;
    token?: string;
    submitted_at?: string;
    hidden?: Record<string, string>;
    answers?: TypeformAnswer[];
  };
};

const normalizeValue = (value: string) => value.trim().toLowerCase();

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

export const getTypeformSourceKey = (responseId: string) => `Typeform:${responseId}`;

export const findClientIdByTypeformResponse = (state: AppState, responseId: string) =>
  state.clients.find((entry) => entry.source === getTypeformSourceKey(responseId))?.id ?? null;

export const buildQuizSubmissionFromTypeformPayload = (payload: TypeformWebhookPayload): QuizSubmission => {
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

export const fetchTypeformResponse = async (formId: string, responseId: string) => {
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

export const verifyTypeformWebhookSignature = (rawBody: string, signatureHeader: string | undefined) => {
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

export const syncTypeformPayloadToClient = async (state: AppState, payload: TypeformWebhookPayload) => {
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

export const registerTypeformWebhook = async () => {
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
