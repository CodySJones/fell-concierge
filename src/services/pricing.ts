import type { ProductType, Purchase } from "../types.ts";

export const PRICING: Record<ProductType, number | null> = {
  DESIGN_PROFILE: 0,
  SAMPLE_BOX: 100,
  CONSULTATION_1_HOUR: 500,
  LOCKIN_RENDER: 500,
  LOCKIN_RENDER_FLOORPLAN_CHANGE: 750,
  REVISIONS: 250,
  SELECTIONS_LIST: 100,
  FULL_PLANS_BUNDLE: 800,
  PROCUREMENT_MARKUP: null,
  SAMPLE_BID: 200
};

export const PRODUCT_LABELS: Record<ProductType, string> = {
  DESIGN_PROFILE: "Free Design Profile",
  SAMPLE_BOX: "Sample Box",
  CONSULTATION_1_HOUR: "1-Hour Consultation",
  LOCKIN_RENDER: "Lock-In Render",
  LOCKIN_RENDER_FLOORPLAN_CHANGE: "Lock-In Render with Floor Plan Change",
  REVISIONS: "Revisions",
  SELECTIONS_LIST: "Selections List",
  FULL_PLANS_BUNDLE: "Full Construction Documents Bundle",
  PROCUREMENT_MARKUP: "Procurement / Materials Markup",
  SAMPLE_BID: "Sample Bid from Armitage Interiors"
};

export const QUALIFYING_PAID_SERVICES: ProductType[] = [
  "CONSULTATION_1_HOUR",
  "LOCKIN_RENDER",
  "LOCKIN_RENDER_FLOORPLAN_CHANGE",
  "REVISIONS"
];

export const isPaidPurchase = (purchase: Purchase): boolean => purchase.status === "PAID" && purchase.amount > 0;

export const hasPaidProduct = (purchases: Purchase[], productType: ProductType): boolean =>
  purchases.some((purchase) => purchase.product_type === productType && isPaidPurchase(purchase));

export const hasQualifyingPaidService = (purchases: Purchase[]): boolean =>
  purchases.some((purchase) => QUALIFYING_PAID_SERVICES.includes(purchase.product_type) && isPaidPurchase(purchase));

export const isFullPlansEligible = (purchases: Purchase[]): boolean =>
  hasPaidProduct(purchases, "SAMPLE_BOX") && hasQualifyingPaidService(purchases);

