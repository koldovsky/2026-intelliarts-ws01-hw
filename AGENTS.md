# AGENTS.md

Practical rules for AI coding agents working in this repository.

---

## Project Overview

This is a **Yarn monorepo fork of the open-source Excalidraw collaborative whiteboard application**, used as a brownfield homework repository for the Intelliarts WS1 workshop.

**Main application:** `excalidraw-app/` — a Vite-based React 19 SPA that renders the Excalidraw canvas, handles Firebase persistence, and manages real-time collaboration via Socket.io.

**Core library packages** (all under `packages/`):

| Package | Path | Role |
|---|---|---|
| `@excalidraw/common` | `packages/common/` | Shared constants, color utils, MIME types |
| `@excalidraw/math` | `packages/math/` | Geometry, vectors, matrix math |
| `@excalidraw/fractional-indexing` | `packages/fractional-indexing/` | Multiplayer element ordering |
| `@excalidraw/element` | `packages/element/` | Element types, mutations, Scene, Store, binding |
| `@excalidraw/utils` | `packages/utils/` | File I/O, export, URL safety |
| `@excalidraw/excalidraw` | `packages/excalidraw/` | Published React component + drawing/action/render logic |

`packages/**` is **source code** — never treat it as a generated or ignorable directory.

---

## Required Context Before Making Changes

Read these files before making any non-trivial change:

### Memory Bank
- `docs/memory/projectbrief.md` — project purpose, modules, and product assumptions
- `docs/memory/techContext.md` — full tech stack, all verified CLI commands, workspace packages, config files
- `docs/memory/systemPatterns.md` — state management, element system, collab architecture, rendering, conventions

### Technical Architecture
- `docs/technical/architecture.md` — data flows, rendering pipeline, action system, package dependency graph, sensitive areas

### Before changing a specific area

| Area | Also read |
|---|---|
| Element types or fields | `packages/element/src/types.ts` |
| AppState shape | `packages/excalidraw/appState.ts` |
| Actions | `packages/excalidraw/actions/types.ts`, `packages/excalidraw/actions/manager.tsx` |
| Store / undo-redo | `packages/element/src/store.ts`, `packages/excalidraw/history.ts` |
| Collaboration | `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.ts` |
| Firebase persistence | `excalidraw-app/data/firebase.ts`, `firebase-project/firestore.rules` |
| Rendering | `packages/excalidraw/renderer/`, `packages/excalidraw/components/canvases/` |
| App entry / wiring | `excalidraw-app/index.tsx`, `excalidraw-app/App.tsx` |
| Monorepo build | root `package.json`, each `packages/*/package.json` |

---

## Development Commands

All commands run from the **monorepo root** using `yarn`.

### Install
```bash
yarn                   # install all workspace dependencies
yarn clean-install     # remove all node_modules and reinstall
```

### Run dev server
```bash
yarn start             # Vite dev server on port 3001, auto-opens browser
```

### Build
```bash
yarn build             # full app build + version info
yarn build:app         # Vite production build → excalidraw-app/build/
yarn build:packages    # build all packages in dependency order (common → math → fractional-indexing → element → excalidraw)
```

> If you modify any file under `packages/`, run `yarn build:packages` before `yarn build:app` (not needed during `yarn start` — Vite resolves via TypeScript path aliases).

### Test
```bash
yarn test:app          # run Vitest once (no watch)
yarn test:all          # full CI suite: typecheck + lint + prettier + vitest
yarn test:typecheck    # TypeScript type check only
yarn test:code         # ESLint only (max-warnings=0)
yarn test:other        # Prettier diff check
yarn test:coverage     # Vitest with coverage report
yarn test:update       # update Vitest snapshots
```

### Lint and format
```bash
yarn fix               # ESLint --fix + Prettier --write
yarn fix:code          # ESLint --fix only
yarn fix:other         # Prettier --write (CSS, SCSS, JSON, MD, HTML, YAML)
```

### Cleanup
```bash
yarn rm:build          # delete all build/dist/dev-dist outputs
yarn rm:node_modules   # delete all node_modules directories
```

### Coverage thresholds (enforced in CI)
- Lines ≥ 60%, branches ≥ 70%, functions ≥ 63%, statements ≥ 60%
- Dropping below any threshold will fail `yarn test:all`

---

## Package and Import Boundaries

### Internal dependency order (must not be reversed)

```
@excalidraw/common          ← no internal deps (foundation)
@excalidraw/math            ← common
@excalidraw/fractional-indexing  ← no internal deps
@excalidraw/element         ← common, math, fractional-indexing
@excalidraw/excalidraw      ← common, element, math
@excalidraw/utils           ← no internal deps (standalone)
excalidraw-app              ← @excalidraw/excalidraw (+ Firebase, Socket.io, Sentry)
```

**Rules:**
- `packages/common`, `packages/math`, and `packages/fractional-indexing` must **not** import from `packages/element` or `packages/excalidraw`.
- `packages/element` must **not** import from `packages/excalidraw`.
- `packages/utils` is intentionally standalone — no internal package imports.
- Only `excalidraw-app` is allowed to import Firebase, Socket.io, Sentry, and idb-keyval.

### Jotai import rule (enforced by ESLint)

| Location | Correct import |
|---|---|
| `excalidraw-app/**` | `import { atom, useAtom } from "excalidraw-app/app-jotai"` |
| `packages/excalidraw/**` | use the internal `editor-jotai` module |
| Anywhere | **Never** import directly from `"jotai"` |

ESLint will block any direct `jotai` import.

### No barrel imports inside `packages/excalidraw/`

Use direct relative paths to the source file. Barrel imports cause circular dependency issues.

### ESM only

All packages output ESM. Do not use `require()`, `module.exports`, or CommonJS patterns anywhere in the monorepo.

### Import order (enforced by ESLint)

1. Node built-ins
2. External npm packages
3. Internal `@excalidraw/*` packages
4. Parent directory imports (`../`)
5. Sibling imports (`./`)
6. Index imports
7. Type-only imports (`import type`)

---

## Architecture Rules

### Element mutations

- **Elements are immutable value objects.** Never mutate an element object in place.
- Always use `newElementWith(element, patch)` from `packages/element/` to produce a modified copy.
- Every mutation **must** increment `version` and randomize `versionNonce`. Missing this breaks multiplayer reconciliation silently.
- Elements are **soft-deleted** only: set `isDeleted: true`. Do not remove elements from the array.
- Deleted elements are included in sync and reconciliation — they must stay in the collection.

### Store and undo/redo

- Every `ActionResult` must include a `captureUpdate` field from the `CaptureUpdateAction` enum:
  - `IMMEDIATELY` — user action, should be undoable
  - `NEVER` — remote sync or scene init, must not pollute the undo stack
  - `EVENTUALLY` — async/multi-step, deferred capture
- Using the wrong value silently breaks undo/redo or multiplayer sync.

### AppState

- `AppState` is owned inside the `Excalidraw` component. External code must interact with it via `ExcalidrawAPI` only.
- Do not read `AppState` fields directly from outside the `packages/excalidraw/` boundary.
- Return partial `appState` patches from `ActionResult` — the updater merges them.

### Jotai atoms

- Atoms are colocated with the feature that owns them — there is no central atom file.
- When adding a new atom in `excalidraw-app/`, define it in the module that owns its feature and import via `app-jotai`.

### Actions

- Actions are objects implementing the `Action` interface (`packages/excalidraw/actions/types.ts`).
- Register new actions via `ActionManager.registerAction()` or `excalidrawAPI.registerAction()`.
- `ActionName` is a closed union of 101 named variants — add new names to the union if introducing new actions.
- `PanelComponent` is optional — only add it if the action needs toolbar UI.

### Rendering

- The canvas uses **three separate layers**: `StaticCanvas` (finished elements), `NewElementCanvas` (in-progress element), `InteractiveCanvas` (selection, handles, cursors).
- Only non-deleted, viewport-visible elements are passed to the static renderer — do not change this culling behavior.
- Element `seed` fields must remain stable — they control RoughJS shape generation and ensure identical rendering across clients.

### Collaboration and encryption

- The `roomKey` lives **only** in the URL hash and in memory. Never log, persist, or transmit it.
- All data sent to Firebase or via Socket.io must be encrypted with `encryptData(roomKey, data)` before transmission.
- Remote element updates must use `captureUpdate: NEVER` when calling `updateScene()` to avoid polluting local undo stacks.
- `getSyncableElements()` is the gate for what gets persisted and synced — changing its predicate changes what gets saved to Firebase.

### Dependency versions

- `.npmrc` sets `save-exact=true`. All versions are pinned. Always use exact versions when adding dependencies. Do not use `^` or `~` version ranges.

---

## Files and Folders to Avoid

Do not read or modify these unless explicitly requested:

| Path | Reason |
|---|---|
| `node_modules/` | Dependency tree, never edit manually |
| `excalidraw-app/build/` | Vite production output, generated |
| `packages/*/dist/` | Package build output, generated |
| `excalidraw-app/dev-dist/` | Vite dev output, generated |
| `coverage/` | Test coverage output, generated |
| `**/*.min.js` | Minified files, generated |
| `**/*.snap` | Vitest snapshots — update via `yarn test:update` only |
| `yarn.lock` | Managed by yarn, do not edit manually |
| `package-lock.json` | Not used (yarn monorepo), do not create |
| `pnpm-lock.yaml` | Not used, do not create |

**Do not avoid `packages/**`** — it contains the core source code.

---

## Safe Change Guidelines

- **Make small, focused changes.** One concern per change. Do not refactor unrelated code.
- **Preserve existing patterns.** Follow the conventions already used in the file or module you are editing (import style, naming, file structure).
- **Do not introduce new dependencies** unless explicitly requested. If needed, use exact versions and place them in the correct `package.json` (app vs. package vs. devDependency).
- **After changing source in `packages/`:** run `yarn test:typecheck` and `yarn test:code` at minimum; run `yarn build:packages` if you need to verify the build output.
- **After changing `excalidraw-app/` source:** run `yarn test:typecheck`, `yarn test:code`, and `yarn test:app`.
- **After changing element types or AppState fields:** search for all usages across `packages/` and `excalidraw-app/` before finishing — both the renderer and the collab layer may read those fields directly.
- **After changing `reconcileElements`, the Store, or `getSyncableElements`:** verify the change does not break multiplayer or undo/redo semantics. These are high-risk areas.
- **Do not update `yarn.lock` manually.** Let yarn manage it.
- **Do not add `console.log` or debug statements** to committed code.
- **Do not use `findDOMNode` or other React APIs deprecated in React 19.**

---

## Verification Checklist

Before marking a task as complete, confirm each item:

- [ ] **Context read:** Did I read the relevant Memory Bank and architecture docs before making changes?
- [ ] **Files changed:** Can I list every file I modified and explain why each change was necessary?
- [ ] **Package boundaries:** Did I respect the internal dependency order? Did I avoid importing across forbidden boundaries?
- [ ] **Jotai imports:** Did I import from `app-jotai` / `editor-jotai`, not directly from `jotai`?
- [ ] **Element immutability:** Did I use `newElementWith()` for every element mutation? Did I increment `version` and `versionNonce`?
- [ ] **CaptureUpdateAction:** Is the correct `captureUpdate` value set on every `ActionResult`?
- [ ] **ESM:** Did I avoid `require()` and CommonJS patterns?
- [ ] **Dependency versions:** Are any new dependencies added with exact versions (`save-exact`)?
- [ ] **Type check:** Did `yarn test:typecheck` pass?
- [ ] **Lint:** Did `yarn test:code` pass with zero warnings?
- [ ] **Tests:** Did `yarn test:app` pass? Did I avoid dropping below coverage thresholds?
- [ ] **Build (if packages changed):** Did `yarn build:packages` succeed?
- [ ] **No unrelated changes:** Did I avoid reformatting or refactoring code outside the scope of the task?
- [ ] **Encryption safety:** If I touched collab or Firebase code, is the `roomKey` still never logged or transmitted?
