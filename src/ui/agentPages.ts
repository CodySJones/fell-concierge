import { getFallonAgentSnapshot } from "../core/fallon/agentRuntime.ts";
import { layout, nav } from "./layout.ts";
import type { AppState, ClientBundle } from "../types.ts";

export const renderAgentPage = (state: AppState, bundles: ClientBundle[]) => {
  const snapshot = getFallonAgentSnapshot(state);
  const latestRun = snapshot.recentRuns[0];

  return layout(
    "Fallon Agent",
    `
      ${nav([
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/logout", label: "Logout" }
      ])}
      <section class="hero">
        <div class="eyebrow">Fallon Local Concierge</div>
        <h1>Agent runtime.</h1>
        <p class="lede">Heartbeat, memory, skills, and deterministic client briefings are available from this admin-only surface.</p>
      </section>
      <section class="metrics" style="margin-top:18px;">
        <div class="metric"><span class="note">Status</span><strong>${snapshot.heartbeat.status}</strong></div>
        <div class="metric"><span class="note">Last Seen</span><strong>${snapshot.heartbeat.last_seen_at}</strong></div>
        <div class="metric"><span class="note">Skills</span><strong>${snapshot.skills.length}</strong></div>
        <div class="metric"><span class="note">Memory Notes</span><strong>${snapshot.memoryCount}</strong></div>
      </section>
      <section class="grid two" style="margin-top:18px;">
        <div class="card flat">
          <h2>Run Agent</h2>
          <div class="stack">
            ${bundles
              .map(
                (bundle) => `
                  <div class="toolbar" style="justify-content:space-between;">
                    <span><strong>${bundle.client.name}</strong><br /><span class="note">${bundle.client.current_state}</span></span>
                    <button type="button" class="ghost" onclick="runAgent('${bundle.client.id}')">Run Briefing</button>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
        <div class="card flat">
          <h2>Active Skills</h2>
          <div class="stack">
            ${snapshot.skills
              .map(
                (skill) => `
                  <div>
                    <strong>${skill.name}</strong>
                    <p class="note">${skill.description}</p>
                    <div class="pill-row">${skill.triggers.map((trigger) => `<span class="pill">${trigger}</span>`).join("")}</div>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </section>
      <section class="card" style="margin-top:18px;">
        <h2>Latest Briefing</h2>
        <pre class="code-block">${latestRun ? JSON.stringify(latestRun.briefing, null, 2) : "No agent run has been recorded yet."}</pre>
      </section>
      <section class="card" style="margin-top:18px;">
        <h2>Recent Runs</h2>
        <table class="table">
          <thead><tr><th>Started</th><th>Client</th><th>Status</th><th>Error</th></tr></thead>
          <tbody>
            ${snapshot.recentRuns
              .map((run) => `<tr><td>${run.started_at}</td><td>${run.client_id}</td><td>${run.status}</td><td>${run.error_message ?? ""}</td></tr>`)
              .join("")}
          </tbody>
        </table>
      </section>
      <script>
        async function runAgent(clientId) {
          const response = await fetch('/api/agent/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId })
          });
          const result = await response.json();
          alert(result.message || result.error || 'Agent run complete.');
          if (response.ok) {
            window.location.reload();
          }
        }
      </script>
    `,
    true
  );
};

