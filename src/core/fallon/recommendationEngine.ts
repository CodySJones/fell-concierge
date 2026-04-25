import type { ClientBundle, OfferRecommendation } from "../../types.ts";
import { deriveReadinessFromUploads } from "../app/intakeUploads.ts";
import { hasPaidProduct, hasQualifyingPaidService, isFullPlansEligible, PRODUCT_LABELS } from "./serviceCatalog.ts";

export interface RecommendationDetail {
  recommendation: OfferRecommendation;
  missingPrerequisites: string[];
  uncertaintyFlags: string[];
}

export const buildRecommendation = (bundle: ClientBundle): RecommendationDetail => {
  const missingPrerequisites: string[] = [];
  const uncertaintyFlags: string[] = [];
  const now = new Date().toISOString();
  const purchases = bundle.purchases;
  const project = bundle.project;
  const readiness = deriveReadinessFromUploads(bundle);

  if (!project) {
    missingPrerequisites.push("Project intake details are missing.");
  }

  if (!hasPaidProduct(purchases, "SAMPLE_BOX")) {
    return {
      recommendation: {
        id: `offer_${bundle.client.id}`,
        client_id: bundle.client.id,
        recommended_offer: "SAMPLE_BOX",
        rationale: "The sample box is the default first paid offer after the free Design Profile and remains the best next step here.",
        eligible: true,
        generated_at: now
      },
      missingPrerequisites,
      uncertaintyFlags
    };
  }

  if (!hasPaidProduct(purchases, "CONSULTATION_1_HOUR")) {
    if (readiness.scanStatus !== "RECEIVED") {
      uncertaintyFlags.push("Scan data is not yet received, so recommendations remain directional rather than final.");
    }
    return {
      recommendation: {
        id: `offer_${bundle.client.id}`,
        client_id: bundle.client.id,
        recommended_offer: "CONSULTATION_1_HOUR",
        rationale: "Sample box is complete. The one-hour consultation is the next paid step and the only consultation product in the funnel.",
        eligible: true,
        generated_at: now
      },
      missingPrerequisites,
      uncertaintyFlags
    };
  }

  if (readiness.scanStatus !== "RECEIVED") {
    missingPrerequisites.push("Room scan information is still missing.");
    return {
      recommendation: {
        id: `offer_${bundle.client.id}`,
        client_id: bundle.client.id,
        recommended_offer: "SCAN_UPLOAD_REQUIRED",
        rationale: "A later-stage render or plan recommendation should wait until scan information is received.",
        eligible: false,
        generated_at: now
      },
      missingPrerequisites,
      uncertaintyFlags: ["No precise selections or contractor-facing plans should be treated as final before scan information is received."]
    };
  }

  if (!hasPaidProduct(purchases, "LOCKIN_RENDER") && !hasPaidProduct(purchases, "LOCKIN_RENDER_FLOORPLAN_CHANGE")) {
    return {
      recommendation: {
        id: `offer_${bundle.client.id}`,
        client_id: bundle.client.id,
        recommended_offer: "LOCKIN_RENDER",
        rationale: "The project has the sample box, a qualifying paid design service, and scan data, so a lock-in render is the next best offer.",
        eligible: true,
        generated_at: now
      },
      missingPrerequisites,
      uncertaintyFlags
    };
  }

  if (!hasPaidProduct(purchases, "REVISIONS")) {
    return {
      recommendation: {
        id: `offer_${bundle.client.id}`,
        client_id: bundle.client.id,
        recommended_offer: "REVISIONS",
        rationale: "Once the lock-in render is reviewed, revisions are the clean next monetized step if changes are needed.",
        eligible: true,
        generated_at: now
      },
      missingPrerequisites,
      uncertaintyFlags
    };
  }

  if (!hasPaidProduct(purchases, "SELECTIONS_LIST")) {
    return {
      recommendation: {
        id: `offer_${bundle.client.id}`,
        client_id: bundle.client.id,
        recommended_offer: "SELECTIONS_LIST",
        rationale: "Selections can be packaged once the concept direction is locked.",
        eligible: true,
        generated_at: now
      },
      missingPrerequisites,
      uncertaintyFlags
    };
  }

  const eligible = isFullPlansEligible(purchases);
  if (eligible && !hasPaidProduct(purchases, "FULL_PLANS_BUNDLE")) {
    return {
      recommendation: {
        id: `offer_${bundle.client.id}`,
        client_id: bundle.client.id,
        recommended_offer: "FULL_PLANS_BUNDLE",
        rationale: `Full plans at $800 are available only after a sample box and at least one qualifying paid design service. Both are complete for this client.`,
        eligible: true,
        generated_at: now
      },
      missingPrerequisites,
      uncertaintyFlags
    };
  }

  return {
    recommendation: {
      id: `offer_${bundle.client.id}`,
      client_id: bundle.client.id,
      recommended_offer: "PROCUREMENT_MARKUP",
      rationale: `${PRODUCT_LABELS.FULL_PLANS_BUNDLE} is already unlocked or sold, so procurement is the next operational revenue stage.`,
      eligible: true,
      generated_at: now
    },
    missingPrerequisites,
    uncertaintyFlags
  };
};

export const describeEligibility = (bundle: ClientBundle) => {
  const sampleBoxPurchased = hasPaidProduct(bundle.purchases, "SAMPLE_BOX");
  const qualifyingPaidService = hasQualifyingPaidService(bundle.purchases);
  const fullPlansEligible = isFullPlansEligible(bundle.purchases);

  return {
    sampleBoxPurchased,
    qualifyingPaidService,
    fullPlansEligible,
    notes: [
      sampleBoxPurchased ? "Sample box purchased." : "Sample box has not been purchased yet.",
      qualifyingPaidService
        ? "At least one qualifying paid design service has been purchased."
        : "A qualifying paid design service is still required before discounted full plans can unlock.",
      fullPlansEligible
        ? "Client qualifies for the $800 full construction documents bundle."
        : "Client does not yet qualify for the $800 full construction documents bundle."
    ]
  };
};
