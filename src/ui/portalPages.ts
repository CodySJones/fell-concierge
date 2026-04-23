import { designProfileMap } from "../data/designProfiles.ts";
import { deriveReadinessFromUploads, getUploadsByType } from "../services/intakeUploads.ts";
import { describeEligibility } from "../services/recommendations.ts";
import { getPaymentProviderLabel } from "../services/payments.ts";
import { PRODUCT_LABELS } from "../services/pricing.ts";
import { getMissingInfo } from "../services/workflow.ts";
import type { ClientBundle } from "../types.ts";
import { layout, nav } from "./layout.ts";

export const renderPortalPage = (bundle: ClientBundle, isAdmin = false) => {
  const primary = bundle.profileResult?.primary_profile ? designProfileMap.get(bundle.profileResult.primary_profile) : undefined;
  const eligibility = describeEligibility(bundle);
  const missingInfo = getMissingInfo(bundle);
  const paymentProviderLabel = getPaymentProviderLabel();
  const readiness = deriveReadinessFromUploads(bundle);
  const scanUploads = getUploadsByType(bundle, "SCAN_FILE");
  const measurementUploads = getUploadsByType(bundle, "MEASUREMENTS_FILE");

  return layout(
    "Client Portal",
    `
      ${nav([
        { href: "/", label: "Quiz" },
        { href: `/result?id=${bundle.client.id}`, label: "Profile Result" },
        { href: "/admin", label: isAdmin ? "Admin Dashboard" : "Admin Login" }
      ])}
      <section class="hero">
        <div class="eyebrow">Client Portal</div>
        <h1>${bundle.client.name}</h1>
        <p class="lede">${bundle.project?.room_type ?? "Bathroom project"} at ${bundle.client.project_address}. This portal tracks the fixed-scope funnel rather than unlimited ongoing design support.</p>
        <div class="pill-row">
          <span class="stage">${bundle.client.current_state}</span>
          <span class="pill">${primary?.name ?? "Profile pending"}</span>
          <span class="pill">${readiness.scanStatus}</span>
        </div>
      </section>
      <section class="split" style="margin-top:18px;">
        <div class="stack">
          <div class="card">
            <h2>Recommendation</h2>
            <p><strong>${bundle.recommendation?.recommended_offer && bundle.recommendation.recommended_offer in PRODUCT_LABELS ? PRODUCT_LABELS[bundle.recommendation.recommended_offer as keyof typeof PRODUCT_LABELS] : bundle.recommendation?.recommended_offer}</strong></p>
            <p class="note">${bundle.recommendation?.rationale ?? ""}</p>
          </div>
          <div class="card">
            <h2>Project Readiness</h2>
            <ul class="list">
              <li>Scan status: ${readiness.scanStatus}</li>
              <li>Measurements status: ${readiness.measurementsStatus}</li>
              <li>Contractor status: ${bundle.project?.contractor_status ?? "Unknown"}</li>
              <li>Budget range: ${bundle.project?.budget_range ?? "Unknown"}</li>
            </ul>
            ${
              missingInfo.length
                ? `<div class="alert" style="margin-top:16px;"><strong>Missing prerequisites</strong><ul class="list">${missingInfo.map((item) => `<li>${item}</li>`).join("")}</ul></div>`
                : `<div class="alert success" style="margin-top:16px;"><strong>Ready for later-stage paid work</strong><p class="note">Core prerequisites are in place for the current stage.</p></div>`
            }
          </div>
          <div class="card">
            <h2>Actions</h2>
            <p class="note">Checkout provider: ${paymentProviderLabel}. Manual payment recording is now admin-only.</p>
            <div class="toolbar">
              <button type="button" id="buy-sample-box">Buy Sample Box</button>
              <button type="button" id="buy-consult" class="secondary">Buy Consultation</button>
              ${isAdmin ? `<button type="button" id="generate-box" class="ghost">Generate Sample Box Prep</button>` : ""}
              ${isAdmin ? `<button type="button" id="generate-brief" class="ghost">Generate Consult Brief</button>` : ""}
              ${isAdmin ? `<button type="button" id="manual-consult" class="ghost">Admin: Mark Consultation Paid</button>` : ""}
            </div>
            <div id="portal-status" class="note" style="margin-top:10px;"></div>
          </div>
          <div class="card">
            <h2>Upload Project Intake</h2>
            <p class="note">Readiness is now based on actual uploads. Add scan files and measurements here instead of toggling statuses manually.</p>
            <form id="upload-form">
              <label class="field"><span>Room Scan File</span><input type="file" name="scanFile" accept=".pdf,.jpg,.jpeg,.png,.heic,.zip,.dwg,.dxf" /></label>
              <label class="field"><span>Measurements File</span><input type="file" name="measurementsFile" accept=".pdf,.jpg,.jpeg,.png,.csv,.xls,.xlsx" /></label>
              <label class="field"><span>Scope Notes</span><textarea name="scopeNotes">${bundle.project?.scope_notes ?? ""}</textarea></label>
              <button type="submit">Upload and Save</button>
            </form>
          </div>
        </div>
        <div class="stack">
          <div class="card">
            <h2>Eligibility Panel</h2>
            <ul class="list">${eligibility.notes.map((item) => `<li>${item}</li>`).join("")}</ul>
            <p class="note">The $800 full plans bundle only unlocks after the sample box and at least one qualifying paid design service.</p>
          </div>
          <div class="card">
            <h2>Sample Box Items</h2>
            ${
              bundle.sampleBoxItems.length
                ? `<ul class="list">${bundle.sampleBoxItems.map((item) => `<li><strong>${item.category}</strong>: ${item.vendor} - ${item.item_name}</li>`).join("")}</ul>`
                : `<p class="note">No sample-box prep generated yet.</p>`
            }
          </div>
          <div class="card">
            <h2>Consult Brief</h2>
            ${
              bundle.consultBrief
                ? `
                    <p>${bundle.consultBrief.summary}</p>
                    <h3 style="margin-top:14px;">Unresolved questions</h3>
                    <ul class="list">${bundle.consultBrief.unresolved_questions.map((item) => `<li>${item}</li>`).join("")}</ul>
                  `
                : `<p class="note">No consult brief generated yet.</p>`
            }
          </div>
          <div class="card">
            <h2>Uploaded Intake Files</h2>
            ${
              scanUploads.length || measurementUploads.length
                ? `
                    <h3>Scans</h3>
                    <ul class="list">${scanUploads.length ? scanUploads.map((upload) => `<li>${upload.original_name} (${Math.round(upload.byte_size / 1024)} KB)</li>`).join("") : "<li>No scan files uploaded yet.</li>"}</ul>
                    <h3 style="margin-top:14px;">Measurements</h3>
                    <ul class="list">${measurementUploads.length ? measurementUploads.map((upload) => `<li>${upload.original_name} (${Math.round(upload.byte_size / 1024)} KB)</li>`).join("") : "<li>No measurement files uploaded yet.</li>"}</ul>
                  `
                : `<p class="note">No intake files uploaded yet.</p>`
            }
          </div>
          <div class="card">
            <h2>Purchases</h2>
            <ul class="list">
              ${bundle.purchases.length ? bundle.purchases.map((purchase) => `<li>${PRODUCT_LABELS[purchase.product_type]} - $${purchase.amount} - ${purchase.status}</li>`).join("") : "<li>No purchases yet.</li>"}
            </ul>
          </div>
        </div>
      </section>
      <script>
        const status = document.getElementById("portal-status");
        const post = async (url, payload, reload = true) => {
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const result = await response.json();
          status.textContent = result.message || result.error || "Saved.";
          if (response.ok && reload) {
            setTimeout(() => window.location.reload(), 700);
          }
          return { response, result };
        };

        const startCheckout = async (productType) => {
          const response = await fetch("/api/checkout/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clientId: "${bundle.client.id}",
              productType,
              returnPath: "/portal?id=${bundle.client.id}"
            })
          });
          const result = await response.json();
          status.textContent = result.message || result.error || "Redirecting to checkout.";
          if (response.ok) {
            window.location.href = result.checkoutUrl;
          }
        };

        document.getElementById("buy-sample-box").addEventListener("click", () => startCheckout("SAMPLE_BOX"));
        document.getElementById("buy-consult").addEventListener("click", () => startCheckout("CONSULTATION_1_HOUR"));
        document.getElementById("generate-box")?.addEventListener("click", () => post("/api/generate/sample-box", { clientId: "${bundle.client.id}" }));
        document.getElementById("generate-brief")?.addEventListener("click", () => post("/api/generate/consult-brief", { clientId: "${bundle.client.id}" }));
        document.getElementById("manual-consult")?.addEventListener("click", () => post("/api/purchase", { clientId: "${bundle.client.id}", productType: "CONSULTATION_1_HOUR" }));
        const fileToBase64 = (file) => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        document.getElementById("upload-form").addEventListener("submit", async (event) => {
          event.preventDefault();
          const formData = new FormData(event.target);
          const uploads = [];
          const scanFile = formData.get("scanFile");
          const measurementsFile = formData.get("measurementsFile");
          if (scanFile && scanFile.size) {
            uploads.push({
              intakeType: "SCAN_FILE",
              originalName: scanFile.name,
              mimeType: scanFile.type,
              base64Data: await fileToBase64(scanFile)
            });
          }
          if (measurementsFile && measurementsFile.size) {
            uploads.push({
              intakeType: "MEASUREMENTS_FILE",
              originalName: measurementsFile.name,
              mimeType: measurementsFile.type,
              base64Data: await fileToBase64(measurementsFile)
            });
          }
          for (const upload of uploads) {
            await post("/api/intake/upload", {
              clientId: "${bundle.client.id}",
              ...upload
            }, false);
          }
          await post("/api/project/update", {
            clientId: "${bundle.client.id}",
            scopeNotes: formData.get("scopeNotes")
          });
        });
      </script>
    `
  );
};
