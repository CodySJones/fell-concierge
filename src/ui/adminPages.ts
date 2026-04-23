import { PRODUCT_LABELS } from "../services/pricing.ts";
import { layout, nav } from "./layout.ts";
import type { AppState, ClientBundle } from "../types.ts";

interface DashboardMetrics {
  leads: number;
  sampleBoxes: number;
  consultations: number;
  fullPlansEligible: number;
}

export const renderAdminPage = (state: AppState, bundles: ClientBundle[], metrics: DashboardMetrics) =>
  layout(
    "Admin Dashboard",
    `
      ${nav([
        { href: "/", label: "Public Quiz" },
        { href: "/admin/logout", label: "Logout" }
      ])}
      <section class="hero">
        <div class="eyebrow">Internal Ops</div>
        <h1>Funnel status at a glance.</h1>
        <p class="lede">This dashboard is now admin-only and focuses on CRM state, missing prerequisites, next recommendations, sample-box prep, and consultation readiness.</p>
      </section>
      <section class="metrics" style="margin-top:18px;">
        <div class="metric"><span class="note">Leads</span><strong>${metrics.leads}</strong></div>
        <div class="metric"><span class="note">Sample Box Purchases</span><strong>${metrics.sampleBoxes}</strong></div>
        <div class="metric"><span class="note">Consultations Purchased</span><strong>${metrics.consultations}</strong></div>
        <div class="metric"><span class="note">Full Plans Eligible</span><strong>${metrics.fullPlansEligible}</strong></div>
      </section>
      <section class="card" style="margin-top:18px;">
        <h2>Client Funnel Table</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Stage</th>
              <th>Profile</th>
              <th>Recommended Next Action</th>
              <th>Missing Info</th>
              <th>Portal</th>
            </tr>
          </thead>
          <tbody>
            ${bundles
              .map(
                (bundle) => `
                  <tr>
                    <td>
                      <strong>${bundle.client.name}</strong><br />
                      <span class="note">${bundle.client.email}</span>
                    </td>
                    <td><span class="stage">${bundle.client.current_state}</span></td>
                    <td>${bundle.profileResult?.primary_profile ?? "Pending"}</td>
                    <td>${bundle.recommendation?.recommended_offer && bundle.recommendation.recommended_offer in PRODUCT_LABELS ? PRODUCT_LABELS[bundle.recommendation.recommended_offer as keyof typeof PRODUCT_LABELS] : bundle.recommendation?.recommended_offer ?? "Pending"}</td>
                    <td>${bundle.project?.scan_status !== "RECEIVED" ? "Scan missing / pending" : "Core intake present"}</td>
                    <td><a href="/portal?id=${bundle.client.id}">Open</a></td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </section>
      <section class="grid two">
        ${bundles
          .map(
            (bundle) => `
              <div class="card flat">
                <div class="stack">
                  <div class="toolbar" style="justify-content:space-between;">
                    <h3>${bundle.client.name}</h3>
                    <span class="stage">${bundle.client.current_state}</span>
                  </div>
                  <p class="note">${bundle.project?.room_type ?? "Room not set"} | ${bundle.project?.budget_range ?? "Budget pending"} | ${bundle.project?.timeline ?? "Timeline pending"}</p>
                  <p><strong>Recommendation:</strong> ${bundle.recommendation?.rationale ?? "Recommendation pending"}</p>
                  <p><strong>Consult brief:</strong> ${bundle.consultBrief?.summary ?? "Not generated yet."}</p>
                  <p><strong>Sample box prep:</strong> ${bundle.sampleBoxItems.length ? `${bundle.sampleBoxItems.length} items prepared` : "Not generated yet."}</p>
                  <p><strong>Email activity:</strong> ${bundle.emailDeliveries.length ? `${bundle.emailDeliveries.length} delivery attempt(s)` : "No email sent yet."}</p>
                  <div class="pill-row">
                    ${bundle.purchases.map((purchase) => `<span class="pill">${PRODUCT_LABELS[purchase.product_type]}</span>`).join("")}
                  </div>
                  <div class="pill-row">
                    ${bundle.emailDeliveries.slice(-3).map((delivery) => `<span class="pill">${delivery.template_type}: ${delivery.status}</span>`).join("")}
                  </div>
                  <div class="toolbar">
                    <button type="button" class="ghost" onclick="runAdminAction('/api/generate/sample-box', '${bundle.client.id}')">Generate Sample Box Prep</button>
                    <button type="button" class="ghost" onclick="runAdminAction('/api/generate/consult-brief', '${bundle.client.id}')">Generate Consult Brief</button>
                    <button type="button" class="ghost" onclick="runAdminEmail('${bundle.client.id}', 'PROFILE_RESULT')">Send Profile Result</button>
                    <button type="button" class="ghost" onclick="runAdminEmail('${bundle.client.id}', 'SAMPLE_BOX_REMINDER')">Send Sample Box Reminder</button>
                    <button type="button" class="ghost" onclick="runAdminEmail('${bundle.client.id}', 'OFFER_FOLLOWUP')">Send Offer Follow-Up</button>
                  </div>
                </div>
              </div>
            `
          )
          .join("")}
      </section>
      <section class="card" style="margin-top:18px;">
        <h2>Design Profile Seed Coverage</h2>
        <p class="note">Profiles seeded: ${state.designProfileResults.length} active results across ${new Set(state.designProfileResults.map((entry) => entry.primary_profile)).size} styles.</p>
      </section>
      <script>
        async function runAdminAction(url, clientId) {
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientId })
          });
          const result = await response.json();
          alert(result.message || result.error || "Action complete.");
          if (response.ok) {
            window.location.reload();
          }
        }
        async function runAdminEmail(clientId, templateType) {
          const response = await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId, templateType })
          });
          const result = await response.json();
          alert((result.message || result.error || 'Email processed.') + (result.status ? ' Status: ' + result.status : ''));
          if (response.ok) {
            window.location.reload();
          }
        }
      </script>
    `,
    true
  );
