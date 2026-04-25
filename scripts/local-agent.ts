import { runFallonAgentForClient } from "../src/core/fallon/agentRuntime.ts";
import { loadState, saveState } from "../src/data/runtimeStore.ts";

const clientId = process.argv[2] ?? "client_demo_jordan";
const state = loadState();
const run = runFallonAgentForClient(state, clientId);
saveState(state);

if (run.status === "FAILED") {
  console.error(run.error_message ?? `Agent run failed for client: ${clientId}`);
  process.exit(1);
}

console.log(JSON.stringify(run, null, 2));
