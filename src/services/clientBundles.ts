import { randomUUID } from "node:crypto";
import { getClientBundle, saveState } from "../data/runtimeStore.ts";
import { getEmailTemplatesForStage, sendTemplatedEmail } from "./emailDelivery.ts";
import { PRICING } from "./pricing.ts";
import { scoreQuiz } from "./quizEngine.ts";
import { buildRecommendation, describeEligibility } from "./recommendations.ts";
import { syncProjectReadinessFromUploads } from "./intakeUploads.ts";
import { deriveClientState } from "./workflow.ts";
import type { AppState, ClientBundle, ProductType, QuizSubmission } from "../types.ts";

export const createClientFromQuizSubmission = async (state: AppState, body: QuizSubmission, sourceOverride?: string) => {
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

export const recordPaidPurchase = (state: AppState, clientId: string, productType: ProductType) => {
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

export const refreshBundle = (state: AppState, clientId: string): ClientBundle => {
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

export const sendStageEmails = async (state: AppState, bundle: ClientBundle) => {
  for (const templateType of getEmailTemplatesForStage(bundle)) {
    await sendTemplatedEmail(state, bundle, templateType);
  }
};

export const buildAdminBundles = (state: AppState) =>
  state.clients.map((client) => getClientBundle(state, client.id)!).map((bundle) => ({
    ...bundle,
    recommendation: buildRecommendation(bundle).recommendation
  }));

export const buildAdminMetrics = (state: AppState, bundles: ClientBundle[]) => ({
  leads: state.clients.length,
  sampleBoxes: state.purchases.filter((purchase) => purchase.product_type === "SAMPLE_BOX" && purchase.status === "PAID").length,
  consultations: state.purchases.filter((purchase) => purchase.product_type === "CONSULTATION_1_HOUR" && purchase.status === "PAID").length,
  fullPlansEligible: bundles.filter((bundle) => describeEligibility(bundle).fullPlansEligible).length
});
