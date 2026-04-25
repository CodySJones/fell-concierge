import { deriveReadinessFromUploads } from "../app/intakeUploads.ts";
import type { ClientBundle, ClientState, Purchase } from "../../types.ts";
import { hasPaidProduct, hasQualifyingPaidService, isFullPlansEligible } from "./serviceCatalog.ts";

const hasPurchase = (purchases: Purchase[], productType: string) =>
  purchases.some((purchase) => purchase.product_type === productType && purchase.status === "PAID");

export const deriveClientState = (bundle: ClientBundle): ClientState => {
  const project = bundle.project;
  const readiness = deriveReadinessFromUploads(bundle);
  const purchases = bundle.purchases;

  if (hasPurchase(purchases, "FULL_PLANS_BUNDLE")) {
    return "FULL_PLANS_PURCHASED";
  }
  if (isFullPlansEligible(purchases)) {
    return "FULL_PLANS_ELIGIBLE";
  }
  if (hasPurchase(purchases, "SELECTIONS_LIST")) {
    return "SELECTIONS_LIST_OFFERED";
  }
  if (hasPurchase(purchases, "REVISIONS")) {
    return "REVISIONS_OFFERED";
  }
  if (hasPurchase(purchases, "LOCKIN_RENDER") || hasPurchase(purchases, "LOCKIN_RENDER_FLOORPLAN_CHANGE")) {
    return "LOCKIN_RENDER_PURCHASED";
  }
  if (hasPurchase(purchases, "CONSULTATION_1_HOUR")) {
    return readiness.scanStatus === "RECEIVED" ? "CONSULTATION_PURCHASED" : "SCAN_REQUESTED";
  }
  if (hasPurchase(purchases, "SAMPLE_BOX")) {
    return "SAMPLE_BOX_PURCHASED";
  }
  if (bundle.profileResult) {
    return "SAMPLE_BOX_OFFERED";
  }
  return "LEAD_CAPTURED";
};

export const getMissingInfo = (bundle: ClientBundle): string[] => {
  const missing: string[] = [];
  const readiness = deriveReadinessFromUploads(bundle);
  if (!bundle.project?.scope_notes) {
    missing.push("Scope notes");
  }
  if (!bundle.project?.budget_range) {
    missing.push("Budget range");
  }
  if (readiness.scanStatus !== "RECEIVED") {
    missing.push("Room scan information");
  }
  if (readiness.measurementsStatus !== "RECEIVED") {
    missing.push("Confirmed measurements");
  }
  if (!bundle.profileResult) {
    missing.push("Design profile result");
  }
  if (!hasPaidProduct(bundle.purchases, "SAMPLE_BOX")) {
    missing.push("Sample box purchase");
  }
  if (!hasQualifyingPaidService(bundle.purchases)) {
    missing.push("Qualifying paid design service");
  }
  return missing;
};
