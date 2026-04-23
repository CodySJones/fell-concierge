import assert from "node:assert/strict";
import { initialState } from "../data/seed.ts";
import { getClientBundle } from "../data/runtimeStore.ts";
import { clearSessionCookie, createSessionCookie, hashPassword, verifyPassword } from "../services/auth.ts";
import { getEmailProviderLabel, getEmailTemplatesForStage, sendTemplatedEmail } from "../services/emailDelivery.ts";
import { deriveReadinessFromUploads, saveUploadedFile } from "../services/intakeUploads.ts";
import { createCheckoutSession, decodePaymentToken, validateCheckoutRequest } from "../services/payments.ts";
import { buildRecommendation } from "../services/recommendations.ts";
import { hasQualifyingPaidService, isFullPlansEligible } from "../services/pricing.ts";

const state = initialState();
const alex = getClientBundle(state, "client_demo_alex");
const casey = getClientBundle(state, "client_demo_casey");
const jordan = getClientBundle(state, "client_demo_jordan");

assert.ok(alex, "Alex bundle should exist");
assert.ok(casey, "Casey bundle should exist");
assert.ok(jordan, "Jordan bundle should exist");

assert.equal(isFullPlansEligible(alex.purchases), false, "Sample box alone must not unlock full plans");
assert.equal(hasQualifyingPaidService(casey.purchases), true, "Casey should have a qualifying paid design service");
assert.equal(isFullPlansEligible(casey.purchases), true, "Sample box plus qualifying paid design service should unlock full plans");
assert.equal(buildRecommendation(jordan).recommendation.recommended_offer, "SAMPLE_BOX", "Quiz-complete leads should default to sample box");
const authHash = hashPassword("demo-password");
assert.equal(verifyPassword("demo-password", authHash), true, "Password hashing should round-trip");
assert.ok(createSessionCookie("admin@example.com").includes("fell_admin_session="), "Admin session cookie should be generated");
assert.ok(clearSessionCookie().includes("Max-Age=0"), "Admin session cookie should be clearable");
const jordanCheckout = validateCheckoutRequest(jordan, "SAMPLE_BOX");
assert.equal(jordanCheckout.ok, true, "Sample box should be checkout-eligible after quiz completion");
const alexRenderCheckout = validateCheckoutRequest(alex, "LOCKIN_RENDER");
assert.equal(alexRenderCheckout.ok, false, "Lock-in render should not be checkout-eligible before scan receipt");
const checkoutSession = await createCheckoutSession(jordan, {
  clientId: jordan.client.id,
  productType: "SAMPLE_BOX",
  returnPath: `/portal?id=${jordan.client.id}`
});
assert.equal(checkoutSession.provider, "mock", "Default checkout provider should be mock");
const token = checkoutSession.checkoutUrl.split("token=")[1];
assert.ok(token, "Mock checkout should include a payment token");
const decoded = decodePaymentToken(decodeURIComponent(token));
assert.equal(decoded?.productType, "SAMPLE_BOX", "Decoded token should preserve the product type");
assert.equal(getEmailProviderLabel(), "Log-only", "Default email provider should stay safe for local use");
assert.deepEqual(getEmailTemplatesForStage(jordan), ["SAMPLE_BOX_REMINDER"], "Pre-sample-box leads should get a sample-box reminder follow-up");
const emailDelivery = await sendTemplatedEmail(state, jordan, "PROFILE_RESULT");
assert.equal(emailDelivery.status, "SIMULATED", "Local email delivery should simulate when no provider is configured");
assert.equal(state.emailDeliveries.length, 1, "Email attempts should be recorded in state");
const uploadState = initialState();
saveUploadedFile(uploadState, {
  clientId: "client_demo_jordan",
  intakeType: "SCAN_FILE",
  originalName: "scan.pdf",
  mimeType: "application/pdf",
  base64Data: Buffer.from("scan-test").toString("base64")
});
const jordanAfterUpload = getClientBundle(uploadState, "client_demo_jordan");
assert.ok(jordanAfterUpload, "Jordan bundle should still exist after upload");
assert.equal(deriveReadinessFromUploads(jordanAfterUpload).scanStatus, "RECEIVED", "Scan readiness should derive from uploaded files");

console.log("Verification passed: pricing, eligibility, auth, checkout, email, and intake-upload rules are working.");
