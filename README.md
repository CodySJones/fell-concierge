# Fell Concierge MVP

Fell Concierge is a focused MVP for Fell & Co's productized interior design funnel. It proves the front half of the business:

- free Design Profile quiz intake
- design profile result generation
- CRM/client stage tracking
- next-step paid offer recommendation
- sample box fulfillment prep
- consultation prep

This app deliberately does **not** promise unlimited free design support, autonomous CAD, AR, or exact construction output before required paid steps and project inputs are complete.

## Stack

- Node.js 24 running TypeScript directly
- Zero-dependency HTTP server
- Server-rendered HTML with lightweight client-side fetch actions
- SQLite-backed datastore persisted to `data/fell-concierge.db`
- Simple cookie-based admin authentication for internal ops routes
- Mock-first checkout flow with optional Stripe Checkout integration
- Real email delivery hooks with safe local simulation mode
- True intake file uploads for scan and measurement readiness

## Setup

### Option 1: bundled runtime in this Codex environment

```powershell
.\scripts\start.ps1
```

### Option 2: local Node install

```powershell
node src/server.ts
```

The app runs at [http://localhost:3000](http://localhost:3000) by default.

Default local admin credentials:

- email: `admin@fellconcierge.local`
- password: `fell-demo-admin`

Change these before sharing the app outside local MVP use.

To reset the demo dataset after signing in as admin:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/reset
```

To run the rule verification script:

```powershell
.\scripts\test.ps1
```

## Environment

See [.env.example](/C:/Users/csjon/Documents/Codex/2026-04-21-build-an-mvp-web-application-called/.env.example).

Supported variables:

- `PORT`: server port, defaults to `3000`
- `APP_NAME`: reserved for future branding/config wiring
- `STORAGE_ROOT`: optional persistent storage root for the SQLite database and uploaded files
- `ADMIN_EMAIL`: admin login email for internal routes
- `ADMIN_PASSWORD`: admin login password for internal routes
- `SESSION_SECRET`: signing secret for the admin session cookie
- `BASE_URL`: public app base URL used for checkout redirects and webhook flows
- `PAYMENT_PROVIDER`: `mock` or `stripe`
- `STRIPE_SECRET_KEY`: Stripe secret key for hosted checkout session creation
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret for `checkout.session.completed`
- `EMAIL_PROVIDER`: `log`, `resend`, or `sendgrid`
- `EMAIL_FROM`: sender email used for outbound funnel emails
- `RESEND_API_KEY`: Resend API key when `EMAIL_PROVIDER=resend`
- `SENDGRID_API_KEY`: SendGrid API key when `EMAIL_PROVIDER=sendgrid`
- `DEMO_RESET=true`: reset runtime data on startup
- `TYPEFORM_FORM_ID`: the live Typeform form id used on `/start`
- `TYPEFORM_API_TOKEN`: Typeform personal access token used for webhook registration and fallback response syncing
- `TYPEFORM_API_BASE_URL`: defaults to `https://api.typeform.com`
- `TYPEFORM_WEBHOOK_SECRET`: optional secret for verifying signed Typeform webhook payloads
- `TYPEFORM_WEBHOOK_TAG`: optional webhook tag name, defaults to `fell-concierge`

## Deployment

The easiest clean production path for this project is:

1. keep Squarespace only as the domain registrar / DNS manager
2. deploy the app to a separate host
3. point `fell-co.com` and `www.fell-co.com` to that host

Because this app stores runtime state in SQLite and accepts uploaded intake files, choose a host with persistent disk. A stateless host will lose data and uploads on restart.

### Recommended host for this MVP

Render is the most practical fit right now because it supports:

- a simple Node web service
- a persistent disk
- environment variables
- a custom domain

I added [render.yaml](/C:/Users/csjon/Documents/Codex/2026-04-21-build-an-mvp-web-application-called/render.yaml) so the project is ready for a straightforward Render deploy.

### Render setup

1. Push this project to GitHub
2. In Render, create a new `Blueprint` or `Web Service` from that repo
3. Confirm the service picks up:
   - build command: `npm install`
   - start command: `npm start`
   - health check path: `/health`
4. Set environment variables:
   - `BASE_URL=https://fell-co.com`
   - `ADMIN_EMAIL=your real admin email`
   - `ADMIN_PASSWORD=a strong password`
   - `SESSION_SECRET=a strong secret`
   - `EMAIL_PROVIDER=resend` or `sendgrid` when ready
   - `EMAIL_FROM=hello@fell-co.com`
   - payment variables if you later enable Stripe
5. Deploy

### Squarespace domain connection

Once the host is live, keep the domain in Squarespace and update DNS there:

1. Open the domain DNS settings in Squarespace
2. Point `www` to the new host using the CNAME record your host provides
3. Point the apex/root domain to the host using the A/ALIAS records your host provides
4. Mark the new host as the primary site destination if the platform requires it

Keep Squarespace only as the domain manager if you are done with their site builder.

### Persistence notes

When `STORAGE_ROOT` is set, the app stores:

- SQLite database in `STORAGE_ROOT/data/fell-concierge.db`
- uploaded scan and measurement files in `STORAGE_ROOT/uploads/`

If `STORAGE_ROOT` is not set, the app uses the project directory for local development.

## Architecture

The code is organized so business rules stay separate from UI:

```text
src/
  data/
    designProfiles.ts      # structured design profile seed data
    runtimeStore.ts        # SQLite-backed runtime persistence and bootstrap
    seed.ts                # demo CRM/project dataset
  services/
    auth.ts                # admin auth and cookie session logic
    emailDelivery.ts       # provider-backed email sending and logging
    emailTemplates.ts      # profile result, reminder, and follow-up templates
    intakeUploads.ts       # file upload intake and readiness derivation
    payments.ts            # mock and Stripe checkout orchestration
    pricing.ts             # pricing table and eligibility logic
    quizEngine.ts          # quiz scoring and profile assignment
    recommendations.ts     # next-step recommendation engine
    workflow.ts            # state derivation and missing-info logic
    generators.ts          # sample-box prep and consult brief generation
    emailTemplates.ts      # stubbed email copy generation
  ui/
    publicPages.ts         # quiz and result pages
    portalPages.ts         # lightweight client portal
    adminPages.ts          # internal admin dashboard
    authPages.ts           # admin login page
    layout.ts              # shared HTML shell
    styles.ts              # app styling
  tests/
    verify.ts              # rules verification script
  server.ts                # routing and API endpoints
```

## Core Data Model

Typed models are defined in [src/types.ts](/C:/Users/csjon/Documents/Codex/2026-04-21-build-an-mvp-web-application-called/src/types.ts) for:

- `Client`
- `Project`
- `DesignProfileResult`
- `Purchase`
- `Deliverable`
- `ProductSelection`
- `SampleBoxItem`
- `ConsultBrief`
- `OfferRecommendation`
- `AdminUser`

The app persists the operational records in SQLite while keeping the existing typed application model in code.

## State Machine

Client/project stages use the required states:

- `LEAD_CAPTURED`
- `PROFILE_GENERATED`
- `PROFILE_DELIVERED`
- `SAMPLE_BOX_OFFERED`
- `SAMPLE_BOX_PURCHASED`
- `SAMPLE_BOX_DELIVERED`
- `SCAN_REQUESTED`
- `SCAN_RECEIVED`
- `CONSULTATION_OFFERED`
- `CONSULTATION_PURCHASED`
- `LOCKIN_RENDER_OFFERED`
- `LOCKIN_RENDER_PURCHASED`
- `SELECTIONS_LOCKED`
- `REVISIONS_OFFERED`
- `SELECTIONS_LIST_OFFERED`
- `FULL_PLANS_ELIGIBLE`
- `FULL_PLANS_PURCHASED`
- `PROCUREMENT_OFFERED`
- `SAMPLE_BID_OFFERED`
- `ARMITAGE_OPPORTUNITY`
- `CLOSED`
- `DORMANT`

The MVP derives current state from purchases, scan readiness, and profile completion inside [src/services/workflow.ts](/C:/Users/csjon/Documents/Codex/2026-04-21-build-an-mvp-web-application-called/src/services/workflow.ts).

## Pricing Logic

Pricing and eligibility rules live in [src/services/pricing.ts](/C:/Users/csjon/Documents/Codex/2026-04-21-build-an-mvp-web-application-called/src/services/pricing.ts).

Implemented business rules:

- Design Profile quiz is free
- Sample box is the default first paid offer at `$100`
- Consultation is a single one-hour product at `$500`
- Lock-in render is `$500`
- Lock-in render with floor plan change is `$750`
- Revisions are `$250`
- Selections list is `$100`
- Full plans bundle is `$800`
- Full plans only unlock when the client has both:
  - purchased the sample box
  - purchased at least one qualifying paid design service
- Qualifying paid design services are:
  - one-hour consultation
  - lock-in render
  - lock-in render with floor plan change
  - revisions
- Free Design Profile does **not** count as qualifying paid design work

## Auth

The internal admin dashboard and internal generation endpoints are protected by a lightweight login flow:

- `GET /admin/login` renders the sign-in form
- successful login sets a signed HTTP-only cookie
- `GET /admin` requires admin authentication
- sample-box prep generation, consult-brief generation, and demo reset require admin authentication
- public quiz intake, result delivery, purchases, and client project updates remain available to the client-facing side of the funnel

This is intentionally simple for MVP/local use and is not yet a production identity system.

## Payments

The MVP now has a real checkout architecture instead of directly marking client purchases paid from the public UI.

- `POST /api/checkout/start` creates a checkout session
- `GET /checkout/mock` renders a local confirmation page when `PAYMENT_PROVIDER=mock`
- `POST /checkout/mock/complete` records the payment in mock mode
- `POST /api/payments/webhook` accepts Stripe `checkout.session.completed` events when Stripe is configured
- `GET /payment/success` is the redirect landing point after hosted checkout

Business-rule enforcement in checkout:

- free Design Profile is not purchasable
- full plans cannot be checked out until the client is actually eligible
- lock-in render products are blocked until scan information is received
- manual purchase recording moved behind admin auth

For local demos, the app defaults to mock checkout so the flow is runnable without external dependencies. If `PAYMENT_PROVIDER=stripe` and `STRIPE_SECRET_KEY` are set, checkout session creation switches to Stripe-hosted checkout. Webhook verification is implemented, but I have not live-tested Stripe network calls in this environment.

## Email

The MVP now sends funnel emails through a dedicated delivery service.

Automatic sends:

- profile result email immediately after quiz completion
- follow-up email after purchase milestones

Admin-triggered sends:

- profile result resend
- sample box reminder
- offer follow-up

Provider modes:

- `EMAIL_PROVIDER=log`: safe local simulation, records delivery attempts without sending externally
- `EMAIL_PROVIDER=resend`: sends through the Resend API
- `EMAIL_PROVIDER=sendgrid`: sends through the SendGrid API

Delivery attempts are stored in SQLite and surfaced in the admin dashboard. I implemented provider integrations and runtime logging, but I have not live-tested external delivery in this restricted environment.

## Intake Uploads

The portal now uses actual file intake instead of manual scan-status toggles.

- clients can upload a room scan file
- clients can upload a measurements file
- readiness is derived from uploaded files, not hand-edited dropdowns
- scan-dependent recommendations now wait for actual uploaded intake
- uploaded intake files are stored under `uploads/<client-id>/`

This is a practical MVP upload system using JSON/base64 transfer from the browser to the server. It is a real file intake flow, but not yet a production-grade large-file pipeline with virus scanning, resumable upload, or cloud object storage.

## MVP Modules Included

- Public quiz page
- Quiz result page
- Lightweight client portal/dashboard
- Internal admin dashboard
- Offer recommendation engine
- Sample box prep generator
- Consultation prep generator
- Basic workflow/state engine
- Pricing and eligibility rules module
- Stub email template generator
- Simple admin login/logout flow
- Mock/Stripe-ready checkout flow
- Email delivery for profile results, reminders, and offer follow-up

## Demo Data

The seeded dataset includes:

- 7 bathroom-oriented design profiles
- 3 mock clients in different funnel stages
- mock purchases
- sample-box prep data
- a consult brief
- a sample selection direction

This makes the app demoable immediately after startup.

## Recommended Next Integrations

- Typeform or website form embed for external quiz capture
- transactional email provider for profile result and offer follow-up
- CubiCasa or similar scan/floorplan intake
- deeper Stripe production hardening and reconciliation
- vendor/procurement system for approved selection data

## Future Scope Not Yet Built

- live vendor database sync
- true scan parsing
- rendering pipeline
- AR visualization
- advanced procurement workflows
- contractor bid automation
