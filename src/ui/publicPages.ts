import { designProfileMap } from "../data/designProfiles.ts";
import { getPaymentProviderLabel } from "../services/payments.ts";
import { PRODUCT_LABELS } from "../services/pricing.ts";
import type { ClientBundle } from "../types.ts";
import { footer, layout, nav } from "./layout.ts";

const typeformEmbedId = "01KPW0ZJQHA1W2WQATT9DVHRBK";

export const renderHomePage = () => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Fell & Co.</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              bone: "#f2ebe1",
              plaster: "#efe6db",
              ink: "#1d1a17",
              smoke: "#676058",
              line: "#d9cfc3",
              moss: "#6e766b"
            },
            fontFamily: {
              serifDisplay: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Baskerville", "Georgia", "serif"],
              sansQuiet: ["Avenir Next", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"]
            },
            boxShadow: {
              quiet: "0 18px 40px rgba(36, 26, 18, 0.05)"
            },
            letterSpacing: {
              calm: "0.18em"
            }
          }
        }
      };
    </script>
    <style>
      html { scroll-behavior: smooth; }
      body { background: #f2ebe1; color: #1d1a17; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/site/homepage.js"></script>
  </body>
</html>`;

export const renderStartPage = () =>
  layout(
    "Start Your Design Profile",
    `
      ${nav([
        { href: "/", label: "Home" },
        { href: "/start", label: "Start Here", cta: true }
      ])}
      <section class="hero start-hero">
        <div class="eyebrow">Design Profile</div>
        <div class="start-hero-grid">
          <div class="stack lg">
            <h1>A quieter way to begin a remodel.</h1>
            <p class="lede">This short profile helps Fell & Co. understand your room, your priorities, and the design direction that fits best before any paid step begins.</p>
            <div class="pill-row">
              <span class="pill">About 3 minutes</span>
              <span class="pill">Kitchen + bath focused</span>
              <span class="pill">Structured next step</span>
            </div>
          </div>
          <div class="hero-panel start-note">
            <span class="badge">Before you begin</span>
            <div class="stack sm">
              <p>Fell & Co. is a structured, design-led studio. This profile is meant to guide the right next paid step, not open-ended free design support.</p>
              <p class="note">You will receive directional guidance, not final construction detail.</p>
            </div>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="grid two start-prep">
          <div class="card soft">
            <div class="stack">
              <h2 style="margin-bottom: 0;">What this covers</h2>
              <ul class="list calm-list">
                <li>Your room type, timing, and overall readiness</li>
                <li>The six Fell & Co. design profiles used in the studio</li>
                <li>The clearest next step in the service path</li>
              </ul>
            </div>
          </div>
          <div class="card soft">
            <div class="stack">
              <h2 style="margin-bottom: 0;">Current design profiles</h2>
              <div class="pill-row">
                ${Array.from(designProfileMap.values()).map((profile) => `<span class="pill">${profile.name}</span>`).join("")}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="card quiz-shell">
          <div class="quiz-shell-head">
            <div class="stack sm">
              <div class="eyebrow">Start the Quiz</div>
              <h2 style="margin-bottom: 0;">Design Profile Intake</h2>
              <p class="note">Answer a few questions and we’ll prepare your design profile result and recommended next step.</p>
            </div>
            <a class="text-link" href="https://form.typeform.com/to/${typeformEmbedId}" target="_blank" rel="noreferrer">Open in a new tab</a>
          </div>
          <div class="quiz-frame">
            <div
              data-tf-live="${typeformEmbedId}"
              data-tf-on-submit="fellTypeformSubmitted"
              style="min-height: 760px; border-radius: 26px; overflow: hidden; background: #fbf7f1;"
            ></div>
          </div>
          <div id="typeform-sync-status" class="note sync-status" aria-live="polite"></div>
        </div>
      </section>
      ${footer()}
      <script src="//embed.typeform.com/next/embed.js"></script>
      <script>
        const syncStatus = document.getElementById("typeform-sync-status");

        const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

        window.fellTypeformSubmitted = async ({ formId, responseId }) => {
          syncStatus.textContent = "Preparing your design profile...";

          try {
            await fetch("/api/typeform/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ formId, responseId })
            });

            for (let attempt = 0; attempt < 30; attempt += 1) {
              const statusResponse = await fetch("/api/typeform/status?responseId=" + encodeURIComponent(responseId), {
                cache: "no-store"
              });
              const status = await statusResponse.json();
              if (status.clientId) {
                window.location.href = "/result?id=" + encodeURIComponent(status.clientId);
                return;
              }

              syncStatus.textContent = attempt < 8
                ? "Preparing your design profile..."
                : "Still syncing your result. This usually only takes another moment.";

              await sleep(1500);
            }

            syncStatus.innerHTML = 'Thanks. Your submission was received, but the result is still syncing. Please check your email for the next step, or <a href="/start">refresh and try again</a> in a moment.';
          } catch (error) {
            syncStatus.innerHTML = 'Thanks. Your submission was received, but the result could not be loaded right away. Please <a href="/start">try again</a> in a moment.';
          }
        };
      </script>
    `
  );

export const renderResultPage = (bundle: ClientBundle) => {
  const primary = bundle.profileResult?.primary_profile ? designProfileMap.get(bundle.profileResult.primary_profile) : undefined;
  const secondary = bundle.profileResult?.secondary_profile ? designProfileMap.get(bundle.profileResult.secondary_profile) : undefined;
  const paymentProviderLabel = getPaymentProviderLabel();

  return layout(
    "Your Fell & Co Design Profile",
    `
      ${nav([
        { href: "/", label: "Home" },
        { href: "/start", label: "Start Here" },
        { href: `/portal?id=${bundle.client.id}`, label: "Continue", cta: true }
      ])}
      <section class="hero">
        <div class="eyebrow">Your Result</div>
        <div class="hero-grid">
          <div class="stack">
            <h1>${bundle.profileResult?.primary_profile ?? "Design Profile"}</h1>
            <p class="lede">${primary?.description ?? ""}</p>
            <div class="pill-row">
              <span class="pill">Primary confidence: ${Math.round((bundle.profileResult?.primary_confidence ?? 0) * 100)}%</span>
              ${
                bundle.profileResult?.secondary_profile
                  ? `<span class="pill">Secondary: ${bundle.profileResult.secondary_profile} (${Math.round((bundle.profileResult.secondary_confidence ?? 0) * 100)}%)</span>`
                  : ""
              }
              <span class="pill">Recommended next step: ${bundle.recommendation?.recommended_offer && bundle.recommendation.recommended_offer in PRODUCT_LABELS ? PRODUCT_LABELS[bundle.recommendation.recommended_offer as keyof typeof PRODUCT_LABELS] : bundle.recommendation?.recommended_offer}</span>
            </div>
          </div>
          <div class="hero-panel stack">
            <span class="badge">What happens next</span>
            <h3>Continue with Fell & Co through the client portal.</h3>
            <p class="note">Your profile is the start, not the whole project. The portal shows your recommended next paid step, tracks readiness, and gives you a clear path forward.</p>
            <a href="/portal?id=${bundle.client.id}"><button type="button" class="accent">Open My Portal</button></a>
          </div>
        </div>
      </section>
      <section class="grid two">
        <div class="card stack">
          <div>
            <h2>Why this profile fits</h2>
            <p>${bundle.profileResult?.rationale ?? ""}</p>
          </div>
          <div>
            <h3>Style cues</h3>
            <div class="pill-row">${(primary?.style_cues ?? []).map((cue) => `<span class="pill">${cue}</span>`).join("")}</div>
          </div>
          <div>
            <h3>Palette and material direction</h3>
            <div class="pill-row">${(primary?.palette_material_direction ?? []).map((cue) => `<span class="pill">${cue}</span>`).join("")}</div>
          </div>
          <div>
            <h3>Avoid notes</h3>
            <ul class="list">${(primary?.avoid_notes ?? []).map((note) => `<li>${note}</li>`).join("")}</ul>
          </div>
        </div>
        <div class="card stack">
          <div>
            <h2>Recommended next step</h2>
            <p>${bundle.recommendation?.rationale ?? ""}</p>
          </div>
          <div class="alert">
            <strong>Important guardrail</strong>
            <p class="note">This is directional guidance only. No exact dimensions, contractor-facing details, or final vendor commitments are implied yet.</p>
          </div>
          <div>
            <h3>Suggested path from here</h3>
            <ul class="list">
              <li>Free Design Profile</li>
              <li>Sample Box ($100)</li>
              <li>1-Hour Consultation ($500)</li>
              <li>Lock-In Render ($500) or with floor plan change ($750)</li>
            </ul>
          </div>
          <p class="note">Checkout provider: ${paymentProviderLabel}. In mock mode, the app simulates payment confirmation for local demos.</p>
          <div class="toolbar">
            <a href="/portal?id=${bundle.client.id}"><button type="button">Continue with Fell & Co</button></a>
            <button type="button" class="secondary" id="purchase-sample-box">Buy Sample Box Now</button>
          </div>
          <div id="purchase-status" class="note"></div>
        </div>
      </section>
      ${
        secondary
          ? `
            <section class="section">
              <div class="card soft">
                <h3>Secondary profile nuance</h3>
                <p><strong>${secondary.name}</strong> can add a secondary layer if the room wants a blended direction instead of a single strict style lane.</p>
              </div>
            </section>
          `
          : ""
      }
      ${footer()}
      <script>
        document.getElementById("purchase-sample-box")?.addEventListener("click", async () => {
          const response = await fetch("/api/checkout/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientId: "${bundle.client.id}", productType: "SAMPLE_BOX", returnPath: "/portal?id=${bundle.client.id}" })
          });
          const result = await response.json();
          const status = document.getElementById("purchase-status");
          status.textContent = result.message || "Redirecting to checkout.";
          if (response.ok) {
            window.location.href = result.checkoutUrl;
          }
        });
      </script>
    `
  );
};
