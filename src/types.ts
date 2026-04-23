export const CLIENT_STATES = [
  "LEAD_CAPTURED",
  "PROFILE_GENERATED",
  "PROFILE_DELIVERED",
  "SAMPLE_BOX_OFFERED",
  "SAMPLE_BOX_PURCHASED",
  "SAMPLE_BOX_DELIVERED",
  "SCAN_REQUESTED",
  "SCAN_RECEIVED",
  "CONSULTATION_OFFERED",
  "CONSULTATION_PURCHASED",
  "LOCKIN_RENDER_OFFERED",
  "LOCKIN_RENDER_PURCHASED",
  "SELECTIONS_LOCKED",
  "REVISIONS_OFFERED",
  "SELECTIONS_LIST_OFFERED",
  "FULL_PLANS_ELIGIBLE",
  "FULL_PLANS_PURCHASED",
  "PROCUREMENT_OFFERED",
  "SAMPLE_BID_OFFERED",
  "ARMITAGE_OPPORTUNITY",
  "CLOSED",
  "DORMANT"
] as const;

export const PRODUCT_TYPES = [
  "DESIGN_PROFILE",
  "SAMPLE_BOX",
  "CONSULTATION_1_HOUR",
  "LOCKIN_RENDER",
  "LOCKIN_RENDER_FLOORPLAN_CHANGE",
  "REVISIONS",
  "SELECTIONS_LIST",
  "FULL_PLANS_BUNDLE",
  "PROCUREMENT_MARKUP",
  "SAMPLE_BID"
] as const;

export const DESIGN_PROFILES = [
  "Traditional",
  "Contemporary",
  "Modern",
  "Transitional",
  "Mid-Century",
  "Natural Minimal",
  "Coastal Calm",
  "Rustic",
  "Industrial Modern",
  "Classic Craftsman",
] as const;

export type ClientState = (typeof CLIENT_STATES)[number];
export type ProductType = (typeof PRODUCT_TYPES)[number];
export type DesignProfileName = (typeof DESIGN_PROFILES)[number];
export type PurchaseStatus = "PENDING" | "PAID" | "REFUNDED" | "CANCELLED";
export type DeliverableStatus = "DRAFT" | "READY" | "SENT";
export type ScanStatus = "NOT_REQUESTED" | "REQUESTED" | "RECEIVED";
export type MeasurementsStatus = "MISSING" | "PARTIAL" | "RECEIVED";
export type SelectionStatus = "PROPOSED" | "LOCKED" | "REVISED";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  project_address: string;
  source: string;
  current_state: ClientState;
  created_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  room_type: string;
  scope_notes: string;
  budget_range: string;
  contractor_status: string;
  timeline: string;
  scan_status: ScanStatus;
  measurements_status: MeasurementsStatus;
}

export interface DesignProfileResult {
  id: string;
  client_id: string;
  primary_profile: DesignProfileName;
  primary_confidence: number;
  secondary_profile: DesignProfileName | null;
  secondary_confidence: number | null;
  rationale: string;
}

export interface Purchase {
  id: string;
  client_id: string;
  product_type: ProductType;
  amount: number;
  status: PurchaseStatus;
  purchased_at: string;
}

export interface Deliverable {
  id: string;
  client_id: string;
  deliverable_type: string;
  status: DeliverableStatus;
  generated_at: string;
}

export interface ProductSelection {
  id: string;
  client_id: string;
  category: string;
  vendor: string;
  product_name: string;
  sku: string;
  finish: string;
  selection_status: SelectionStatus;
}

export interface SampleBoxItem {
  id: string;
  client_id: string;
  category: string;
  vendor: string;
  item_name: string;
  notes: string;
}

export interface ConsultBrief {
  id: string;
  client_id: string;
  summary: string;
  unresolved_questions: string[];
  recommended_topics: string[];
}

export interface OfferRecommendation {
  id: string;
  client_id: string;
  recommended_offer: string;
  rationale: string;
  eligible: boolean;
  generated_at: string;
}

export type EmailTemplateType = "PROFILE_RESULT" | "SAMPLE_BOX_REMINDER" | "OFFER_FOLLOWUP";
export type EmailDeliveryStatus = "PENDING" | "SENT" | "FAILED" | "SIMULATED";

export interface EmailDelivery {
  id: string;
  client_id: string;
  template_type: EmailTemplateType;
  subject: string;
  to_email: string;
  status: EmailDeliveryStatus;
  provider: string;
  provider_message_id: string | null;
  error_message: string | null;
  sent_at: string;
}

export type IntakeFileType = "SCAN_FILE" | "MEASUREMENTS_FILE" | "REFERENCE_FILE";

export interface IntakeUpload {
  id: string;
  client_id: string;
  intake_type: IntakeFileType;
  original_name: string;
  stored_name: string;
  mime_type: string;
  byte_size: number;
  uploaded_at: string;
  note: string;
}

export interface DesignProfileSeed {
  name: DesignProfileName;
  description: string;
  style_cues: string[];
  approved_vendors: Record<string, string[]>;
  palette_material_direction: string[];
  avoid_notes: string[];
}

export interface AppState {
  clients: Client[];
  projects: Project[];
  designProfileResults: DesignProfileResult[];
  purchases: Purchase[];
  deliverables: Deliverable[];
  productSelections: ProductSelection[];
  sampleBoxItems: SampleBoxItem[];
  consultBriefs: ConsultBrief[];
  offerRecommendations: OfferRecommendation[];
  emailDeliveries: EmailDelivery[];
  intakeUploads: IntakeUpload[];
}

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface ClientBundle {
  client: Client;
  project: Project | undefined;
  profileResult: DesignProfileResult | undefined;
  purchases: Purchase[];
  deliverables: Deliverable[];
  sampleBoxItems: SampleBoxItem[];
  consultBrief: ConsultBrief | undefined;
  recommendation: OfferRecommendation | undefined;
  selections: ProductSelection[];
  emailDeliveries: EmailDelivery[];
  intakeUploads: IntakeUpload[];
}

export interface QuizSubmission {
  name: string;
  email: string;
  phone: string;
  projectAddress: string;
  roomType: string;
  scopeNotes: string;
  budgetRange: string;
  contractorStatus: string;
  timeline: string;
  source: string;
  answers: string[];
}
