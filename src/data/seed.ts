import { designProfiles } from "./designProfiles.ts";
import type { AppState } from "../types.ts";

const now = new Date().toISOString();

export const initialState = (): AppState => ({
  clients: [
    {
      id: "client_demo_alex",
      name: "Alex Mercer",
      email: "alex@example.com",
      phone: "555-0100",
      project_address: "18 Greene St, Brooklyn, NY",
      source: "Instagram",
      current_state: "SAMPLE_BOX_PURCHASED",
      created_at: now
    },
    {
      id: "client_demo_jordan",
      name: "Jordan Lee",
      email: "jordan@example.com",
      phone: "555-0142",
      project_address: "74 Pacific Ave, Santa Monica, CA",
      source: "Referral",
      current_state: "PROFILE_DELIVERED",
      created_at: now
    },
    {
      id: "client_demo_casey",
      name: "Casey Dunn",
      email: "casey@example.com",
      phone: "555-0136",
      project_address: "540 Ashby Rd, Austin, TX",
      source: "Organic Search",
      current_state: "CONSULTATION_PURCHASED",
      created_at: now
    }
  ],
  projects: [
    {
      id: "project_demo_alex",
      client_id: "client_demo_alex",
      room_type: "Primary bathroom",
      scope_notes: "Need a warm bathroom refresh that keeps the existing layout and improves materials.",
      budget_range: "$15k–$25k",
      contractor_status: "Shortlisting contractors",
      timeline: "Summer start",
      scan_status: "REQUESTED",
      measurements_status: "PARTIAL"
    },
    {
      id: "project_demo_jordan",
      client_id: "client_demo_jordan",
      room_type: "Guest bathroom",
      scope_notes: "Small-space update with more visual punch and better lighting.",
      budget_range: "$8k–$15k",
      contractor_status: "No contractor selected",
      timeline: "Within 6 months",
      scan_status: "NOT_REQUESTED",
      measurements_status: "MISSING"
    },
    {
      id: "project_demo_casey",
      client_id: "client_demo_casey",
      room_type: "Primary bathroom",
      scope_notes: "Needs layout guidance, storage improvement, and a calmer finish palette.",
      budget_range: "$25k–$40k",
      contractor_status: "Contractor already engaged",
      timeline: "Ready now",
      scan_status: "RECEIVED",
      measurements_status: "RECEIVED"
    }
  ],
  designProfileResults: [
    {
      id: "dpr_demo_alex",
      client_id: "client_demo_alex",
      primary_profile: "Classic Craftsman",
      primary_confidence: 0.64,
      secondary_profile: "Traditional",
      secondary_confidence: 0.22,
      rationale: "Warm wood tones, heritage detailing, and an artisanal finish direction point strongly toward Classic Craftsman."
    },
    {
      id: "dpr_demo_jordan",
      client_id: "client_demo_jordan",
      primary_profile: "Mid-Century",
      primary_confidence: 0.52,
      secondary_profile: "Contemporary",
      secondary_confidence: 0.27,
      rationale: "The quiz response favored walnut warmth, graphic contrast, and a more expressive retro-informed finish direction."
    },
    {
      id: "dpr_demo_casey",
      client_id: "client_demo_casey",
      primary_profile: "Natural Minimal",
      primary_confidence: 0.7,
      secondary_profile: "Contemporary",
      secondary_confidence: 0.16,
      rationale: "Low-contrast materials, architectural calm, and tactile finishes all support Natural Minimal."
    }
  ],
  purchases: [
    {
      id: "purchase_demo_alex_1",
      client_id: "client_demo_alex",
      product_type: "SAMPLE_BOX",
      amount: 100,
      status: "PAID",
      purchased_at: now
    },
    {
      id: "purchase_demo_casey_1",
      client_id: "client_demo_casey",
      product_type: "SAMPLE_BOX",
      amount: 100,
      status: "PAID",
      purchased_at: now
    },
    {
      id: "purchase_demo_casey_2",
      client_id: "client_demo_casey",
      product_type: "CONSULTATION_1_HOUR",
      amount: 500,
      status: "PAID",
      purchased_at: now
    }
  ],
  deliverables: [
    {
      id: "deliverable_demo_casey_1",
      client_id: "client_demo_casey",
      deliverable_type: "CONSULT_BRIEF",
      status: "READY",
      generated_at: now
    }
  ],
  productSelections: [
    {
      id: "selection_demo_casey_1",
      client_id: "client_demo_casey",
      category: "tile",
      vendor: "Heath Ceramics",
      product_name: "Mock tonal field tile direction",
      sku: "MOCK-TILE-001",
      finish: "matte warm ivory",
      selection_status: "PROPOSED"
    }
  ],
  sampleBoxItems: [
    {
      id: "sample_demo_alex_1",
      client_id: "client_demo_alex",
      category: "tile",
      vendor: "Fireclay Tile",
      item_name: "Tile finish swatch set",
      notes: "Mock sample set for material direction only."
    }
  ],
  consultBriefs: [
    {
      id: "brief_demo_casey_1",
      client_id: "client_demo_casey",
      summary: "Natural Minimal primary profile. Client has purchased the sample box and one-hour consultation. Scan and measurements received, so the project is ready for a lock-in render recommendation.",
      unresolved_questions: ["Confirm whether storage tower is in scope.", "Clarify shower niche priorities."],
      recommended_topics: ["layout tradeoffs", "finish durability", "budget allocation", "contractor handoff expectations"]
    }
  ],
  offerRecommendations: [
    {
      id: "offer_demo_alex",
      client_id: "client_demo_alex",
      recommended_offer: "CONSULTATION_1_HOUR",
      rationale: "Sample box has been purchased. The strongest next paid step is the one-hour consultation while scan details are still coming in.",
      eligible: true,
      generated_at: now
    },
    {
      id: "offer_demo_jordan",
      client_id: "client_demo_jordan",
      recommended_offer: "SAMPLE_BOX",
      rationale: "The quiz is complete, but no paid product has been purchased. The sample box is the intended first conversion.",
      eligible: true,
      generated_at: now
    },
    {
      id: "offer_demo_casey",
      client_id: "client_demo_casey",
      recommended_offer: "LOCKIN_RENDER",
      rationale: "Sample box and qualifying paid design work are complete, and scan information has been received.",
      eligible: true,
      generated_at: now
    }
  ],
  emailDeliveries: [],
  intakeUploads: []
});

export const seedMetadata = {
  designProfileCount: designProfiles.length
};
