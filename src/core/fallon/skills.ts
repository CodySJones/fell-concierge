import type { AgentSkill } from "../../types.ts";

const now = () => new Date().toISOString();

export const buildDefaultFallonSkills = (): AgentSkill[] => [
  {
    id: "skill_fallon_client_briefing",
    code: "CLIENT_BRIEFING",
    name: "Client briefing",
    description: "Summarize client/project state into a durable Fallon operating brief.",
    triggers: ["new intake", "admin review", "before client follow-up"],
    guardrails: ["Use persisted client state as the source of truth.", "Call out missing prerequisites explicitly."],
    active: true,
    created_at: now()
  },
  {
    id: "skill_fallon_next_action",
    code: "NEXT_ACTION",
    name: "Next action recommendation",
    description: "Choose the next Fell service step from eligibility and readiness rules.",
    triggers: ["profile delivered", "purchase recorded", "scan received"],
    guardrails: ["Do not invent offers outside the service catalog.", "Keep eligibility decisions deterministic."],
    active: true,
    created_at: now()
  },
  {
    id: "skill_fallon_open_loops",
    code: "OPEN_LOOP_TRACKING",
    name: "Open loop tracking",
    description: "Track missing inputs and unresolved client/project prerequisites as agent memory.",
    triggers: ["agent run", "upload received", "state transition"],
    guardrails: ["Separate client facts from tasks.", "Do not mark readiness complete without supporting state."],
    active: true,
    created_at: now()
  }
];

