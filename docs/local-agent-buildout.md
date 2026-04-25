# Local Fallon Agent Buildout

## Goal

Build the agent locally before connecting it to an always-on Hermes, OpenClaw, Telegram, or hosted workflow.

The local agent should act as the Fell & Co software brain:

- read normalized client/project state
- summarize durable client memory
- identify the next service action
- name missing prerequisites
- enforce project-readiness guardrails
- produce deterministic output that can later feed an LLM, skill, or messaging runtime

## Current Local Entry Point

Run a briefing for a demo client:

```powershell
node scripts\local-agent.ts client_demo_jordan
```

Default client:

```powershell
node scripts\local-agent.ts
```

The agent implementation lives in:

```text
src/core/fallon/agent.ts
```

The runtime wrapper lives in:

```text
src/core/fallon/agentRuntime.ts
```

It records:

- `agent_runs`
- `agent_memories`
- `agent_heartbeats`
- `agent_skills`

Admin routes:

- `/admin/agent` renders the local runtime dashboard.
- `/api/agent/status` returns heartbeat, skills, recent runs, and memory count.
- `/api/agent/run` runs the agent for a selected client and persists the result.

The public `/health` route also includes a compact agent status block.

## Design Rules

1. Start with one focused agent.
   The first local agent is `Fallon Local Concierge`, not a swarm. It owns client briefing and next-action reasoning only.

2. Use durable local state first.
   The agent reads the same `ClientBundle` used by the app, so it inherits profile results, purchases, uploads, recommendations, readiness, and email history.

3. Keep business logic deterministic.
   Profile scoring, offer progression, eligibility, and readiness remain code-owned. A model can later draft copy, but it should not decide eligibility.

4. Treat memory as structured notes.
   The local agent emits and persists `memoryNote.clientFacts`, `projectPreferences`, `businessContext`, and `openLoops`. These can later become Hermes-style skill/memory inputs.

5. Keep integrations isolated.
   Telegram, Obsidian, Airtable, email, and payment execution should connect through adapters after the local agent contract is stable.

## Next Iteration

- Add a model adapter for drafting client-safe follow-up copy from the deterministic briefing.
- Add external adapters for Telegram, Obsidian, Airtable, or a hosted workflow once the local contract is stable.
- Add scheduled/background execution if the agent needs to run without admin interaction.
