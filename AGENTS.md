# Fell Concierge Working Notes

## Canonical Project Location

Use this folder as the single active working copy:

`C:\Users\csjon\OneDrive\Documents\GitHub\fell-concierge`

`C:\Users\csjon\OneDrive\Documents\project.fell` may exist as a Windows directory junction for compatibility with older Codex chats. Do not treat it as a separate working copy or duplicate project. If a tool reports that the old chat working directory is missing, start a new Codex chat/project pointed directly at the canonical GitHub folder above.

Older Codex-generated copies may exist only as archives. Do not edit those unless the user explicitly asks to recover something from an archive.

## Run And Verify

Use the bundled Node runtime if `node` or `npm` is not available on PATH.

Verification command:

`C:\Users\csjon\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe src\tests\verify.ts`

Syntax check:

`C:\Users\csjon\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe --check src\server.ts`

## Product Boundary

The Fallon core lives under `src\core\fallon`.

The app should primarily own:

- intake normalization
- profile scoring
- service recommendation logic
- project readiness state
- client-facing portal state

Keep integrations behind boundaries under `src\integrations` and route handling under `src\routes`.

Avoid adding broad CRM, payment execution, or email-delivery ownership directly into the core Fallon logic unless the user explicitly chooses that direction.
