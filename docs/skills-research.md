# Agent Skills research — Excalidraw

Repeatable workflows worth turning into Agent Skills for this repo, found while
onboarding. A "skill" = a documented, repeatable procedure (+ optional scripts)
an agent can invoke (`.claude/skills/` or `.cursor/skills/`).

## Repeatable workflows observed

1. **Add a new action** — every user operation follows the same shape
   (`actionXxx.tsx`: `name`, `perform()`, `keyTest()`, `PanelComponent`, then
   register it). Highly repetitive and error-prone to do by hand.
2. **Pre-PR verification** — the same gate every time: `test:typecheck` →
   `test` → `test:code` (+ `fix`). Easy to forget a step.
3. **Add a new element type / shape** — touches `packages/element` (model,
   bounds, collision) + rendering + toolbar; many coordinated edits.

## Proposed skills (priority order)

### 1. `new-action` (recommended)
- **Why:** the action system is THE extension point; scaffolding it correctly
  (incl. `keyTest()` via `@excalidraw/common` `matchKey`, registration, a
  colocated test) removes the most common source of mistakes.
- **What it does:** generates `actionXxx.tsx` from a template, wires the key
  binding through `KEYS`, registers the action, and creates a `*.test.tsx` stub.

### 2. `verify-excalidraw` (recommended)
- **Why:** encodes the project's quality gate so it can't be skipped.
- **What it does:** runs `yarn test:typecheck && yarn test && yarn test:code`,
  summarizes failures, and offers `yarn fix` for lint/format issues.

### 3. `new-element` (optional, larger)
- **Why:** adding a shape is multi-file and must keep `element` invariants
  (bounds, collision, binding). A guided skill reduces drift.

## How this maps to the workshop

`new-action` + `verify-excalidraw` directly support Task 3 (capability slice):
the slice is implemented as an action, then verified by the same gate. This is
the brownfield pattern — encode the repo's repeatable procedures as skills so AI
follows existing conventions instead of inventing new ones.
