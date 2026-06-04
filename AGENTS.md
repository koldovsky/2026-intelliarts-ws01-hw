# AGENTS.md - working rules for this repo

Rules for AI agents (and humans) working in the Excalidraw monorepo. These are derived from the [Memory Bank](docs/memory/) and the [architecture doc](docs/technical/architecture.md); read those for the "why". This file is the "what you must and must not do".

## Golden rules

1. Verify against the code. This snapshot was stripped of its original docs and reconstructed. Treat every doc (including this one) as a hypothesis and confirm line numbers / behaviour in the source before depending on them.
2. Respect the one-way package graph. Dependencies point downward only: `excalidraw-app` -> `@excalidraw/excalidraw` -> `@excalidraw/element` -> `@excalidraw/{common,math,fractional-indexing}`. Never import "upward". Specifically: nothing in `packages/element/` may import from `packages/excalidraw/`, and nothing in `packages/` may import from `excalidraw-app/`.
3. Keep element data and UI state separate. Element data lives in the `Scene` (`packages/element/src/Scene.ts`). View/UI state lives in `appState` (the `App` React state, type in `packages/excalidraw/types.ts:274`). `appState` references elements by id; it must not own element objects.

## Import boundaries

- Put a shared helper in the lowest package that fits. Colours and keys are in `@excalidraw/common`; geometry is in `@excalidraw/math`. Reuse them; do not copy them up into the editor.
- Inside `packages/excalidraw`, import cross-package symbols from the package root (`@excalidraw/element`, `@excalidraw/common`), matching the style already in the file you are editing.
- Do not add a new third-party dependency without flagging it first. Check whether `common`/`math` already cover the need.

## Element conventions

- Create elements with the factories in `packages/element/src/newElement.ts` (`newElement`, `newTextElement`, `newLinearElement`, `newArrowElement`, `newImageElement`, `newFrameElement`). Do not hand-build element literals; the factories set `seed`, `version`, `index`, and the style defaults.
- Change elements through `mutateElement` (`packages/element/src/mutateElement.ts:37`) or `newElementWith` for an immutable copy. Never reassign `version` / `versionNonce` / `updated` by hand - mutation bumps them for you, and getting this wrong breaks collaboration reconciliation and undo/redo.
- Branch on element type with the guards in `packages/element/src/typeChecks.ts` (`isLinearElement`, `isTextElement`, `isBindableElement`, ...). Avoid raw `element.type === "..."` chains.
- A new element type touches several places in lockstep: the union in `packages/element/src/types.ts`, a factory in `newElement.ts`, drawing in `renderElement.ts` / `shape.ts`, and usually a tool/action and toolbar entry. Trace an existing comparable type end to end before adding one.

## Action conventions

- Add a user command as an Action, not a method on `App`. Define it in `packages/excalidraw/actions/`, give it a unique `name`, and `register({...})` it (`actions/register.ts`).
- `perform` must return an `ActionResult` (`actions/types.ts:25`): `elements` if it changes the scene, an `appState` patch if it changes UI, and a `captureUpdate` value. Use `CaptureUpdateAction.IMMEDIATELY` for a discrete undoable edit, `EVENTUALLY` to fold into the next one, `NEVER` for ephemeral/remote changes.
- Wire keyboard triggers via `keyTest`; reuse the matchers/`KEYS` in `packages/common/src/keys.ts` rather than comparing raw key strings.

## Commands

Run from the repo root with `yarn` (this is a Yarn 1 workspace - do not use npm or pnpm):

- `yarn start` - dev server for the web app.
- `yarn test` - Vitest. `yarn test:app --watch=false` for a single CI-style run.
- `yarn test:update --watch=false` - update snapshots after an intentional change.
- `yarn test:typecheck` - `tsc`. `yarn test:code` - ESLint. `yarn test:other` - Prettier check.
- `yarn test:all` - everything the way CI runs it.
- `yarn fix` - auto-format and auto-fix lint.

## What an agent may do without asking

- Add an action, a shape factory, a keyboard shortcut, or a toolbar control that follows the patterns above, with a test.
- Fix failing tests, type errors, lint errors.
- Update snapshots when a change is intentional, and say so.

## What to propose first, then do

- Anything that crosses package boundaries or changes a package's public surface (`packages/*/index.ts`, `packages/excalidraw/index.tsx`).
- New dependencies, build/config changes, schema or data-format changes (`packages/excalidraw/data/`).

## What not to do

- Do not bypass the pre-commit hook (`--no-verify`) or commit with failing `yarn test:all`.
- Do not edit generated output (`dist/`, `build/`, `**/*.snap` by hand, `yarn.lock` directly).
- Do not introduce a mock/fake data path; the editor works on real element data.
- Do not reorder elements by renumbering `index` by hand - use the fractional-index sync helpers in `packages/element/src/fractionalIndex.ts`.
