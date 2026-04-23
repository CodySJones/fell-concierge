# Fell & Co Site Notes

## Adjust Copy

Edit homepage copy in [public/site/content.js](/C:/Users/csjon/Documents/Codex/2026-04-21-build-an-mvp-web-application-called/public/site/content.js).

## Adjust Spacing

Edit the outer section padding and max-widths in [public/site/components.js](/C:/Users/csjon/Documents/Codex/2026-04-21-build-an-mvp-web-application-called/public/site/components.js).

Primary spacing controls:

- `Section` component padding classes
- `Header` top and bottom padding
- `MinimalList`, `StepList`, and layout gap values

## Adjust Typography

There are two places to tune the typographic feel:

1. Tailwind theme fonts and colors in [src/ui/publicPages.ts](/C:/Users/csjon/Documents/Codex/2026-04-21-build-an-mvp-web-application-called/src/ui/publicPages.ts)
2. Component-level text sizing classes in [public/site/components.js](/C:/Users/csjon/Documents/Codex/2026-04-21-build-an-mvp-web-application-called/public/site/components.js)

## Current Structure

- `/` = refined React + Tailwind homepage
- `/start` = design profile intake form
- `/result?id=...` = profile result page
- `/portal?id=...` = client portal

## Design Intent

The homepage is intentionally restrained:

- warm off-white background
- near-black text
- no gradients
- no dashboard UI patterns
- minimal CTAs
- spacious pacing
- neutral image placeholders instead of noisy stock imagery
