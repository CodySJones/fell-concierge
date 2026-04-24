# Morning Brief

## What Changed Overnight

I did not add new user-facing software features overnight.

I audited the current repo against the hybrid ops strategy and documented the target ownership model in:

- `docs/agent-software-strategy.md`

## Core Conclusion

The current app is strongest when treated as:

- intake normalizer
- profile scoring engine
- recommendation engine
- project-readiness tracker
- portal state layer

It is weakest when treated as:

- full CRM
- full payments product
- full email system
- full operational dashboard

## Main Codebase Tensions

1. `src/server.ts`
- too much routing and orchestration in one file

2. `src/services/payments.ts`
- useful logic mixed with temporary checkout ownership

3. `src/services/emailDelivery.ts`
- direct delivery logic is embedded too deeply for the hybrid model

4. `src/services/generators.ts`
- placeholder fulfillment logic risks pretending the app owns operations it does not really own

5. `src/ui/portalPages.ts`
- client portal is carrying too many operational behaviors

## Best Next Steps

1. Split `src/server.ts` into route modules
- intake
- typeform
- portal
- admin
- payments

2. Decide source-of-truth strategy
- either Airtable is the broader ops source of truth and this app owns agent state
- or this app is the source of truth and Airtable is a synchronized ops surface

3. Narrow the portal
- profile
- recommendation
- readiness
- next action only

4. Introduce integration boundaries
- keep business rules in-app
- move delivery/external system behavior behind adapters

## Open Decisions

1. Should the app own canonical client/project state, or should Airtable?
2. Should the client portal remain in this app long-term, or move to Glide while the app becomes the agent brain?
3. Should payment execution stay in-app at all, or only eligibility and recommendation logic?

## If Starting Fresh Tomorrow

I would start with:

1. define the source-of-truth decision
2. split `src/server.ts`
3. trim `src/ui/portalPages.ts` to a narrower client-facing scope
4. leave the website and quiz polish secondary to that software refocus
