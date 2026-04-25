import type { ClientBundle, ProductType } from "../../types.ts";
import { getMissingInfo } from "./clientState.ts";
import { buildRecommendation, describeEligibility } from "./recommendationEngine.ts";
import { PRODUCT_LABELS } from "./serviceCatalog.ts";
import { deriveReadinessFromUploads } from "../app/intakeUploads.ts";

export interface FallonAgentMemoryNote {
  clientFacts: string[];
  projectPreferences: string[];
  businessContext: string[];
  openLoops: string[];
}

export interface FallonAgentBriefing {
  agentName: "Fallon Local Concierge";
  operatingMode: "LOCAL_DETERMINISTIC";
  clientId: string;
  generatedAt: string;
  summary: string;
  currentState: string;
  recommendedAction: {
    code: string;
    label: string;
    eligible: boolean;
    rationale: string;
  };
  missingPrerequisites: string[];
  uncertaintyFlags: string[];
  guardrails: string[];
  memoryNote: FallonAgentMemoryNote;
  suggestedTasks: string[];
}

const offerLabel = (code: string): string => {
  if (code in PRODUCT_LABELS) {
    return PRODUCT_LABELS[code as ProductType];
  }
  if (code === "SCAN_UPLOAD_REQUIRED") {
    return "Request room scan upload";
  }
  return code
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const compactList = (items: Array<string | undefined | null>) =>
  items.filter((item): item is string => Boolean(item && item.trim()));

const buildSuggestedTasks = (
  bundle: ClientBundle,
  recommendationCode: string,
  missingPrerequisites: string[],
  uncertaintyFlags: string[]
) => {
  const tasks: string[] = [];

  if (!bundle.profileResult) {
    tasks.push("Generate or recover the Design Profile result before recommending paid work.");
  }

  if (recommendationCode === "SAMPLE_BOX") {
    tasks.push("Prepare a sample box conversion follow-up that references the primary design profile.");
  } else if (recommendationCode === "CONSULTATION_1_HOUR") {
    tasks.push("Frame the one-hour consultation around unresolved scope, budget, and readiness questions.");
  } else if (recommendationCode === "SCAN_UPLOAD_REQUIRED") {
    tasks.push("Ask for scan and measurement files before advancing to render or plans recommendations.");
  } else {
    tasks.push(`Prepare the handoff for ${offerLabel(recommendationCode)}.`);
  }

  if (missingPrerequisites.length > 0) {
    tasks.push(`Collect missing prerequisites: ${missingPrerequisites.join(", ")}.`);
  }
  if (uncertaintyFlags.length > 0) {
    tasks.push("Keep the client-facing language directional until uncertainty flags are cleared.");
  }

  return tasks;
};

export const buildFallonAgentBriefing = (bundle: ClientBundle): FallonAgentBriefing => {
  const recommendationDetail = buildRecommendation(bundle);
  const eligibility = describeEligibility(bundle);
  const readiness = deriveReadinessFromUploads(bundle);
  const profile = bundle.profileResult;
  const project = bundle.project;
  const missingInfo = getMissingInfo(bundle);
  const missingPrerequisites = [
    ...new Set([...recommendationDetail.missingPrerequisites, ...missingInfo])
  ];
  const recommendation = recommendationDetail.recommendation;

  const clientFacts = compactList([
    `Client: ${bundle.client.name}`,
    `Email: ${bundle.client.email}`,
    bundle.client.phone ? `Phone: ${bundle.client.phone}` : null,
    bundle.client.project_address ? `Project address: ${bundle.client.project_address}` : null,
    `Source: ${bundle.client.source}`,
    `Current state: ${bundle.client.current_state}`
  ]);

  const projectPreferences = compactList([
    project?.room_type ? `Room: ${project.room_type}` : null,
    project?.scope_notes ? `Scope: ${project.scope_notes}` : null,
    project?.budget_range ? `Budget: ${project.budget_range}` : null,
    project?.timeline ? `Timeline: ${project.timeline}` : null,
    project?.contractor_status ? `Contractor status: ${project.contractor_status}` : null,
    profile ? `Primary profile: ${profile.primary_profile} (${Math.round(profile.primary_confidence * 100)}%)` : null,
    profile?.secondary_profile ? `Secondary profile: ${profile.secondary_profile}` : null
  ]);

  const businessContext = [
    eligibility.sampleBoxPurchased ? "Sample box is paid." : "Sample box is not paid.",
    eligibility.qualifyingPaidService ? "Qualifying paid design service is complete." : "Qualifying paid design service is still needed.",
    eligibility.fullPlansEligible ? "Full plans eligibility is unlocked." : "Full plans eligibility is not unlocked.",
    `Scan status: ${readiness.scanStatus}.`,
    `Measurements status: ${readiness.measurementsStatus}.`
  ];

  const summary = `${bundle.client.name} is at ${bundle.client.current_state}. Recommended next action is ${offerLabel(recommendation.recommended_offer)} because ${recommendation.rationale}`;

  return {
    agentName: "Fallon Local Concierge",
    operatingMode: "LOCAL_DETERMINISTIC",
    clientId: bundle.client.id,
    generatedAt: new Date().toISOString(),
    summary,
    currentState: bundle.client.current_state,
    recommendedAction: {
      code: recommendation.recommended_offer,
      label: offerLabel(recommendation.recommended_offer),
      eligible: recommendation.eligible,
      rationale: recommendation.rationale
    },
    missingPrerequisites,
    uncertaintyFlags: recommendationDetail.uncertaintyFlags,
    guardrails: [
      "Do not promise construction-ready outputs before scan data, measurements, and paid service prerequisites are complete.",
      "Keep payment execution, email delivery, and external CRM sync behind integration boundaries.",
      "Treat style/profile output as directional until later-stage project inputs are confirmed.",
      "Recommend the next Fell service step; do not invent custom offers outside the service catalog."
    ],
    memoryNote: {
      clientFacts,
      projectPreferences,
      businessContext,
      openLoops: missingPrerequisites.length > 0 ? missingPrerequisites : ["No blocking local prerequisites detected."]
    },
    suggestedTasks: buildSuggestedTasks(
      bundle,
      recommendation.recommended_offer,
      missingPrerequisites,
      recommendationDetail.uncertaintyFlags
    )
  };
};
