---
name: excalidraw-feature
description: >-
  Implements Excalidraw editor features (shapes, shortcuts, toolbar) using the
  element and action patterns. Use when adding a new shape, tool, keyboard
  shortcut, toolbar control, or element type in packages/element or packages/excalidraw.
---

# Excalidraw Feature

Guide for adding editor capabilities in this monorepo. Read first:

- [AGENTS.md](../../../AGENTS.md) — rules and import boundaries
- [docs/memory/systemPatterns.md](../../../docs/memory/systemPatterns.md) — actions, Scene, rendering
- [docs/technical/architecture.md](../../../docs/technical/architecture.md) — data flow

Finish with the **excalidraw-verify** skill before marking complete.

## When to Use

- New primitive shape or element type
- New keyboard shortcut or undoable command
- Toolbar / tool button / panel option in the editor
- NOT for: collab-only (`excalidraw-app/collab/`), Firebase, export formats (use export paths in AGENTS.md)

## Step 1 — Classify the Feature

| Type | Primary packages | Undoable? |
|------|------------------|-----------|
| **Shape / element** | `packages/element`, `packages/excalidraw/components` | Usually yes (via actions) |
| **Keyboard shortcut** | `packages/excalidraw/actions`, `keys.ts` | Yes |
| **Toolbar / tool** | `packages/excalidraw/components`, `appState.ts` | Often yes |
| **App-only** (save, share, collab) | `excalidraw-app/` | Varies |

If the change is product-only, **stop** and implement under `excalidraw-app/`, not `packages/excalidraw`.

## Step 2 — Find an Exemplar

Before writing code, locate a similar existing feature:

```bash
# Example: how rectangles are created in tests
rg "type: \"rectangle\"" packages/excalidraw/tests --glob "*.tsx" -l | head -3
```

**Reference files:**

| Concern | Exemplar path |
|---------|---------------|
| Element factory | `packages/element/src/newElement.ts` |
| Render on canvas | `packages/element/src/renderElement.ts` (search `case "rectangle"`) |
| Element types | `packages/element/src/types.ts` |
| Pointer commit | `packages/excalidraw/actions/actionFinalize.tsx` |
| Action contract | `packages/excalidraw/actions/types.ts` |
| Register action | `packages/excalidraw/actions/register.ts` |
| Action barrel | `packages/excalidraw/actions/index.ts` |
| Shortcuts | `packages/excalidraw/keys.ts` |
| Test helpers | `packages/excalidraw/tests/helpers/api.ts`, `ui.ts` |

Copy structure from the closest neighbor; do not start from `App.tsx` (~12k lines).

## Step 3 — Shape / Element Checklist

For a new drawable primitive:

- [ ] **Type** — extend union in `packages/element/src/types.ts` if new `type` string
- [ ] **Factory** — `newElement.ts` (or existing factory pattern for that family)
- [ ] **Render** — branch in `renderElement.ts`
- [ ] **Bounds / hit-test** — `bounds.ts`, `shape.ts`, or type checks if other shapes do
- [ ] **Tool** — register tool in UI (`components/`, active tool in `appState.ts`)
- [ ] **Pointer flow** — creation during drag; commit via `actionFinalize` on pointer up
- [ ] **Action** — if user-facing and undoable: new file in `actions/`, `register()`, export in `index.ts`
- [ ] **captureUpdate** — `IMMEDIATELY` on commit; `EVENTUALLY` during drag; `NEVER` for remote-only
- [ ] **i18n** — label in `packages/excalidraw/locales/en.json` only
- [ ] **Test** — Vitest next to related tests (e.g. `packages/excalidraw/tests/tool.test.tsx`)

### State rules

- Elements live in **Scene** (`packages/element/src/Scene.ts`), not Jotai
- Undoable updates go through **actions** → `App.syncActionResult` (`packages/excalidraw/components/App.tsx`)
- Ephemeral drag: `scene.mutateElement` + `triggerRender`; commit on pointer up

## Step 4 — Keyboard Shortcut Checklist

- [ ] New or extended action in `packages/excalidraw/actions/`
- [ ] `register({ name, perform, keyTest?, ... })`
- [ ] `perform` returns `ActionResult` with correct `captureUpdate`
- [ ] Wire shortcut in `packages/excalidraw/keys.ts` or action `keyTest`
- [ ] Test in `packages/excalidraw/tests/shortcuts.test.tsx` or adjacent test file

## Step 5 — Toolbar / UI Checklist

- [ ] UI in `packages/excalidraw/components/` (follow existing tool buttons / `Actions.tsx` patterns)
- [ ] Trigger via `actionManager.executeAction(...)` for undoable ops
- [ ] Do not store tool/selection state in Jotai — use `AppState`

## Step 6 — Package Boundaries

When adding imports:

- `element` → may use `common`, `math`, `fractional-indexing`
- `excalidraw` → may use `element`, `common`, `math`, `utils`
- **Never** import `excalidraw-app` from library packages

Use `@excalidraw/element`, not `../../../packages/element/...`.

## Step 7 — Tests

Add or extend a Vitest test that exercises the feature:

```typescript
// Pattern from existing tests
import { UI } from "@excalidraw/excalidraw/tests/helpers/ui";
import { API } from "@excalidraw/excalidraw/tests/helpers/api";
```

Place the test beside similar tests in the same package.

## Step 8 — Verify

Run `yarn test:typecheck` and `yarn test` before claiming work is complete. Invoke **excalidraw-verify** (or run manually):

```bash
yarn test:typecheck
yarn test
yarn test:app --watch=false
```

## Anti-Patterns

- Putting drawing state in Jotai (`editor-jotai.ts` is for peripheral UI only)
- Undoable edits without `register()` + `captureUpdate`
- Drawing logic duplicated in `App.tsx` instead of `renderElement.ts`
- Editing all `locales/*.json` files
- New runtime `element` → `excalidraw` imports (type-only exists historically — avoid adding more)
- Skipping tests for behavior changes

## Done When

- [ ] Checklist for the feature type is complete
- [ ] At least one test covers the new behavior
- [ ] **excalidraw-verify** passes
- [ ] Changes are minimal and match exemplar style
