import { randomUUID } from "node:crypto";
import type { AgentMemory, AgentRun, AppState } from "../../types.ts";
import { getClientBundle } from "../../data/runtimeStore.ts";
import { buildFallonAgentBriefing, type FallonAgentBriefing } from "./agent.ts";
import { buildDefaultFallonSkills } from "./skills.ts";

const AGENT_NAME = "Fallon Local Concierge";
const HEARTBEAT_ID = "heartbeat_fallon_local_concierge";

const now = () => new Date().toISOString();

export const ensureFallonAgentState = (state: AppState) => {
  if (state.agentSkills.length === 0) {
    state.agentSkills = buildDefaultFallonSkills();
  }

  if (!state.agentHeartbeats.some((heartbeat) => heartbeat.id === HEARTBEAT_ID)) {
    state.agentHeartbeats.push({
      id: HEARTBEAT_ID,
      agent_name: AGENT_NAME,
      status: "READY",
      last_seen_at: now(),
      last_run_id: null,
      last_error: null
    });
  }
};

const heartbeat = (state: AppState) => {
  ensureFallonAgentState(state);
  return state.agentHeartbeats.find((entry) => entry.id === HEARTBEAT_ID)!;
};

const replaceClientMemory = (state: AppState, clientId: string, runId: string, briefing: FallonAgentBriefing) => {
  const createdAt = now();
  const toMemory = (category: AgentMemory["category"], content: string): AgentMemory => ({
    id: randomUUID(),
    client_id: clientId,
    category,
    content,
    source_run_id: runId,
    created_at: createdAt
  });

  state.agentMemories = state.agentMemories.filter((entry) => entry.client_id !== clientId);
  state.agentMemories.push(
    ...briefing.memoryNote.clientFacts.map((content) => toMemory("CLIENT_FACT", content)),
    ...briefing.memoryNote.projectPreferences.map((content) => toMemory("PROJECT_PREFERENCE", content)),
    ...briefing.memoryNote.businessContext.map((content) => toMemory("BUSINESS_CONTEXT", content)),
    ...briefing.memoryNote.openLoops.map((content) => toMemory("OPEN_LOOP", content))
  );
};

export const runFallonAgentForClient = (state: AppState, clientId: string): AgentRun => {
  ensureFallonAgentState(state);
  const activeHeartbeat = heartbeat(state);
  const runId = randomUUID();
  const startedAt = now();

  activeHeartbeat.status = "RUNNING";
  activeHeartbeat.last_seen_at = startedAt;
  activeHeartbeat.last_run_id = runId;
  activeHeartbeat.last_error = null;

  const run: AgentRun = {
    id: runId,
    agent_name: AGENT_NAME,
    client_id: clientId,
    status: "RUNNING",
    briefing: {},
    error_message: null,
    started_at: startedAt,
    completed_at: null
  };
  state.agentRuns.push(run);

  try {
    const bundle = getClientBundle(state, clientId);
    if (!bundle) {
      throw new Error(`Client not found: ${clientId}`);
    }

    const briefing = buildFallonAgentBriefing(bundle);
    run.status = "COMPLETED";
    run.briefing = briefing as unknown as Record<string, unknown>;
    run.completed_at = now();
    replaceClientMemory(state, clientId, runId, briefing);

    activeHeartbeat.status = "READY";
    activeHeartbeat.last_seen_at = run.completed_at;
    return run;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown agent error";
    run.status = "FAILED";
    run.error_message = message;
    run.completed_at = now();
    activeHeartbeat.status = "ERROR";
    activeHeartbeat.last_seen_at = run.completed_at;
    activeHeartbeat.last_error = message;
    return run;
  }
};

export const getFallonAgentSnapshot = (state: AppState) => {
  ensureFallonAgentState(state);
  const runs = [...state.agentRuns].sort((a, b) => b.started_at.localeCompare(a.started_at));
  return {
    heartbeat: heartbeat(state),
    skills: state.agentSkills.filter((skill) => skill.active),
    recentRuns: runs.slice(0, 10),
    memoryCount: state.agentMemories.length
  };
};

