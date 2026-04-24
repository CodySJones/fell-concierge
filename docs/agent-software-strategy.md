# Fell & Co Agent Software Strategy

## Current Product Direction

Fell & Co is using a hybrid ops stack.

That means the app should not try to own the entire business.
It should own the parts where custom logic, controlled handoff, and branded client state matter.

## What The App Should Own

These are the parts that are defensible as custom software:

1. Intake normalization
- receive quiz submissions from Typeform
- normalize them into a stable internal client/project shape
- map quiz answers into the Fell & Co style taxonomy

2. Design profile result logic
- score the quiz
- assign primary and secondary profiles
- store rationale
- support future custom quiz scoring without changing downstream logic

3. Recommendation engine
- decide the next step in the Fell & Co service path
- enforce eligibility rules
- keep product progression structured

4. Project readiness state
- track whether the project is ready for later-stage work
- model missing prerequisites
- distinguish directional guidance from production-ready inputs

5. Client-facing portal state
- present current profile
- present current recommendation
- present project readiness and missing inputs
- provide controlled next-step actions

6. Internal agent layer
- function as the software brain that interprets quiz inputs, project state, and progression rules
- remain useful even if intake and CRM tooling change

## What External Tools Should Own

These should remain outside the core app unless there is a strong reason to bring them in:

1. Typeform
- quiz authoring
- image-based quiz UI for now

2. Airtable
- operational source of truth for broader client/project workflows if that remains the chosen ops layer

3. Glide
- lightweight client dashboard if it outpaces the custom portal for speed

4. Zapier
- glue between Typeform, Airtable, email, and scheduling systems

5. Calendly
- booking

6. Stripe or external checkout
- payment processing itself

7. Gmail / Resend / SendGrid
- message delivery rather than in-app communication tooling

## Where The Current App Is Misaligned

The current codebase still assumes a more all-in-one product in several places.

### 1. Payment flow is too productized

Files:
- `src/services/payments.ts`
- `src/server.ts`
- `src/ui/portalPages.ts`

Problem:
- the app still owns checkout session creation, mock checkout pages, and portal purchase actions
- this is useful for local demos, but it is not aligned with the stated hybrid stack

Recommendation:
- keep payment eligibility logic in-app
- move actual checkout ownership behind an adapter boundary
- treat current mock/Stripe flow as temporary infrastructure

### 2. Email flow is too embedded

Files:
- `src/services/emailDelivery.ts`
- `src/services/emailTemplates.ts`
- `src/server.ts`

Problem:
- the app is deciding delivery timing and sending messages directly
- in the hybrid stack, delivery should likely be event-driven and integration-led

Recommendation:
- preserve template rendering if useful
- move send triggers toward an event model
- reduce direct coupling between business actions and immediate message delivery

### 3. “Generators” are demo-product artifacts

Files:
- `src/services/generators.ts`

Problem:
- `generateSampleBox` and `generateConsultBrief` are acting like internal production generators
- today they are placeholders tied to profile vendor lists, not real operational systems

Recommendation:
- rename this module later to make its status explicit, or split it
- keep consult/sample-box suggestion logic only if it supports the agent layer
- do not let this imply the app is the real fulfillment system

### 4. Server routes are too monolithic

Files:
- `src/server.ts`

Problem:
- routing, orchestration, Typeform handling, portal actions, payments, and admin behavior all live in one file

Recommendation:
- split route handlers by domain:
  - intake
  - typeform
  - portal
  - admin
  - payments
  - email/events

### 5. The portal still mixes “agent state” with “operational action center”

Files:
- `src/ui/portalPages.ts`

Problem:
- portal currently exposes purchase actions, upload actions, generated outputs, and admin-adjacent behavior in one screen

Recommendation:
- narrow the portal to:
  - current profile
  - current recommendation
  - current readiness
  - next required action
- move internal operations out of the client surface

## Recommended Product Architecture

The app should evolve toward this shape:

1. `intake`
- Typeform payload ingestion
- future custom quiz ingestion
- normalization into internal entities

2. `profile-engine`
- style taxonomy
- scoring logic
- rationale generation

3. `recommendation-engine`
- offer progression logic
- eligibility logic
- readiness-aware next-step selection

4. `client-state`
- derived state machine
- missing prerequisites
- confidence/readiness flags

5. `portal`
- read-only or lightly interactive client-facing layer

6. `integrations`
- Typeform
- Airtable
- payments
- email
- scheduling

## Concrete Refactor Priorities

### Priority 1
Split `src/server.ts` by domain and isolate orchestration from transport.

### Priority 2
Define a stable internal domain around:
- client
- project
- profile result
- recommendation
- readiness

### Priority 3
Create adapter boundaries for:
- payments
- email
- Typeform

### Priority 4
Reduce client portal scope to agent-facing essentials.

### Priority 5
Decide whether Airtable becomes the operational source of truth, or whether this app remains the source of truth for agent state and syncs outward.

## Near-Term Rule

Until the architecture is split:

- add product logic in services, not directly in `server.ts`
- do not add new operational features to the portal without checking whether they belong in the hybrid stack
- prefer “agent brain” improvements over “mini SaaS” improvements
