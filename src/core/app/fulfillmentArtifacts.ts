import { randomUUID } from "node:crypto";
import { designProfileMap } from "../../data/designProfiles.ts";
import type { ClientBundle, ConsultBrief, ProductSelection, SampleBoxItem } from "../../types.ts";

export const generateSampleBox = (bundle: ClientBundle): SampleBoxItem[] => {
  const profileNames = [bundle.profileResult?.primary_profile, bundle.profileResult?.secondary_profile].filter(Boolean);
  const items: SampleBoxItem[] = [];

  for (const profileName of profileNames) {
    const profile = designProfileMap.get(profileName!);
    if (!profile) {
      continue;
    }
    for (const category of ["tile", "plumbing_fixtures", "lighting", "hardware"]) {
      const vendors = profile.approved_vendors[category] ?? [];
      if (vendors.length === 0) {
        continue;
      }
      items.push({
        id: randomUUID(),
        client_id: bundle.client.id,
        category,
        vendor: vendors[0],
        item_name: `${category.replaceAll("_", " ")} reference`,
        notes: "Mock fulfillment suggestion only. Include swatch, finish reference, or catalog tear sheet when available."
      });
    }
  }

  return items.slice(0, 8);
};

export const generateConsultBrief = (bundle: ClientBundle): ConsultBrief => {
  const project = bundle.project;
  const profile = bundle.profileResult;
  const unresolvedQuestions: string[] = [];

  if (project?.scan_status !== "RECEIVED") {
    unresolvedQuestions.push("Scan file is still missing, so dimensions and precise fit should not be treated as final.");
  }
  if (project?.measurements_status !== "RECEIVED") {
    unresolvedQuestions.push("Measurements need confirmation before any contractor-facing plan set is considered precise.");
  }
  unresolvedQuestions.push("Confirm whether layout changes are desired before steering toward the floor-plan-change render.");

  return {
    id: randomUUID(),
    client_id: bundle.client.id,
    summary: `${profile?.primary_profile ?? "Unassigned"} profile leaning for a ${project?.room_type ?? "bathroom"} project. Budget ${project?.budget_range ?? "not yet provided"}, contractor status: ${project?.contractor_status ?? "unknown"}, timeline: ${project?.timeline ?? "unknown"}. Guidance is directional until scan and measurements are fully confirmed.`,
    unresolved_questions: unresolvedQuestions,
    recommended_topics: ["design priorities", "layout constraints", "budget guardrails", "material durability", "next paid deliverable"]
  };
};

export const buildSelectionsSummary = (bundle: ClientBundle): ProductSelection[] => {
  const profile = bundle.profileResult?.primary_profile ? designProfileMap.get(bundle.profileResult.primary_profile) : undefined;
  if (!profile) {
    return [];
  }

  return Object.entries(profile.approved_vendors)
    .slice(0, 5)
    .map(([category, vendors], index) => ({
      id: randomUUID(),
      client_id: bundle.client.id,
      category,
      vendor: vendors[0] ?? "Placeholder vendor to be confirmed",
      product_name: `${category.replaceAll("_", " ")} direction ${index + 1}`,
      sku: `MOCK-${category.toUpperCase()}-${index + 1}`,
      finish: "Direction only - exact sku not yet finalized",
      selection_status: "PROPOSED"
    }));
};
