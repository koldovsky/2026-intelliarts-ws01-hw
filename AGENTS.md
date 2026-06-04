# Agent Rules — Excalidraw Monorepo

Guidance for AI agents working in this repository. Grounded in the [Memory Bank](docs/memory/) and [architecture docs](docs/technical/architecture.md).

## Project Summary

**Excalidraw** is an open-source virtual whiteboard (React 19, TypeScript, HTML Canvas, Rough.js). This repo is a Yarn workspaces monorepo:

- **`excalidraw-app/`** — production web app (collaboration, persistence, PWA)
- **`packages/excalidraw/`** — embeddable editor library
- **`packages/element/`** — element model, scene graph, canvas primitives
- **`packages/common/`**, **`packages/math/`**, **`packages/fractional-indexing/`**, **`packages/utils/`** — shared layers

Upstream README and dev-docs may be absent in this snapshot. Treat `docs/memory/` and `docs/technical/` as the source of truth for structure and patterns.

## Commands

Run from repository root:

| Command | Purpose |
|---------|---------|
| `yarn install` | Install workspace dependencies |
| `yarn start` | Dev server (`excalidraw-app`, Vite) |
| `yarn test` | Vitest tests |
| `yarn test:all` | Typecheck + ESLint + Prettier + tests |
| `yarn test:typecheck` | `tsc` only |
| `yarn test:code` | ESLint only |
| `yarn build:packages` | Build libs: common → fractional-indexing → math → element → excalidraw |
| `yarn build` | Production build of the app |
| `yarn fix` | Auto-fix prettier + eslint |

## Package Layers and Import Boundaries

Respect dependency direction for **new** code:

```
fractional-indexing
common → math → element → excalidraw → excalidraw-app
utils (sibling; consumed by excalidraw)
```

| Package | May import from | Must not import from |
|---------|-----------------|----------------------|
| `packages/common` | `common`, type-only from `element` / `excalidraw` where already established | `excalidraw` runtime, `excalidraw-app` |
| `packages/math` | `common`, `math` | `element`, `excalidraw`, `excalidraw-app` |
| `packages/element` | `common`, `math`, `fractional-indexing`, `element` | `excalidraw-app`; avoid new runtime imports from `excalidraw` |
| `packages/excalidraw` | `common`, `element`, `math`, `excalidraw`, `utils` | `excalidraw-app` |
| `excalidraw-app` | `@excalidraw/excalidraw`, `@excalidraw/common` | Deep `packages/*` paths unless matching an existing app pattern |

Use workspace imports (`@excalidraw/element`, …), not cross-package relative paths.

## State Management (Critical)

Core editor state does **not** live in Jotai.

| Layer | Location | Use for |
|-------|----------|---------|
| **AppState** | `App.state`, `packages/excalidraw/appState.ts` | Tool, zoom, scroll, selection UI, theme |
| **Scene** | `packages/element/src/Scene.ts` | Elements, mutations, selection helpers |
| **Store** | `packages/element/src/store.ts` | Undo/redo, `CaptureUpdateAction` |
| **Editor Jotai** | `packages/excalidraw/editor-jotai.ts` | Library UI only (sidebar, dialogs, pickers) |
| **App Jotai** | `excalidraw-app/app-jotai.ts` | Product chrome (collab, share, language) |

Undoable changes go through actions → `ActionResult` → `App.syncActionResult` (`packages/excalidraw/components/App.tsx`).

## Implementation Patterns

**Undoable mutations:** `packages/excalidraw/actions/` → `register()` → `perform()` → `syncActionResult`. Wire shortcuts in `keys.ts` or UI via `ActionManager`.

**Ephemeral pointer ops:** `scene.mutateElement` during drag; commit on pointer up via `actionFinalize` with `CaptureUpdateAction.IMMEDIATELY`.

**New elements:** `types.ts` → `newElement.ts` → `renderElement.ts` → toolbar/actions in `packages/excalidraw/components/`.

**Rendering:** Three canvases (static, interactive, new-element). Draw in `renderElement.ts`; do not duplicate drawing logic in `App.tsx`.

## Where to Change Code

| Change type | Primary locations |
|-------------|-------------------|
| Primitive shape / element behavior | `packages/element/`, `packages/excalidraw/actions/`, `components/` |
| Keyboard shortcut | `packages/excalidraw/keys.ts`, `actions/` |
| Toolbar / panel UI | `packages/excalidraw/components/` |
| Export / import / persistence format | `packages/excalidraw/data/`, `scene/export.ts` |
| Collaboration / Firebase / local save | `excalidraw-app/collab/`, `excalidraw-app/data/` |
| Public embed API | `packages/excalidraw/index.tsx`, imperative API on `App` |

Prefer the **smallest owning package**. Editor logic stays in `packages/excalidraw` / `packages/element`; product-only behavior stays in `excalidraw-app`.

---

## Agents Should

### Understand before changing

- Read relevant Memory Bank docs (`docs/memory/systemPatterns.md` for editor work) before touching core code.
- Explore the codebase in layers: workspace layout → package → file → symbol. **Verify** AI summaries against actual source.
- When unsure where logic lives, check `docs/technical/architecture.md` and grep for existing patterns instead of inventing new structure.

### Match the codebase

- Follow naming, file placement, and test style of neighboring files in the same package.
- Reuse existing actions, element factories, and UI components rather than duplicating logic.
- Keep diffs minimal and scoped to the requested behavior—no drive-by refactors, formatting sweeps, or unrelated dependency bumps.
- Prefer extending the action system, element layer, or existing components over adding parallel mechanisms.

### Respect architecture

- Route undoable user operations through the action system and `syncActionResult`.
- Put editor behavior in `packages/excalidraw` / `packages/element`; put hosting, collab, and account-level features in `excalidraw-app`.
- Honor package import boundaries (see table above).
- Use `CaptureUpdateAction` correctly: ephemeral updates during drag, `IMMEDIATELY` on commit, `NEVER` for remote/sync-only updates.

### Quality and verification

- Add or update Vitest tests when behavior changes; place tests next to related `*.test.ts(x)` files.
- Run `yarn test:typecheck` and `yarn test` (or `yarn test:all` before larger PRs) before claiming work is complete.
- For spec-driven work, use the repo’s OpenSpec workflow (`openspec/`, `.cursor/skills/openspec-*`) and run `openspec validate --strict` when applicable.
- Document non-obvious decisions only where the code cannot speak for itself.

### Context and i18n

- Use `.cursorignore` as guidance for what to deprioritize (build artifacts, snapshots, bulk locales)—not as an excuse to skip `packages/**` source.
- For user-visible strings, update `packages/excalidraw/locales/en.json` only unless explicitly asked to translate all locales.

---

## Agents Must Not

### Break core invariants

- Store drawing, selection, or scene data in Jotai (or other peripheral state) instead of `AppState` / `Scene` / `Store`.
- Implement undoable edits by ad-hoc `setState` + scene mutation without going through actions and `captureUpdate`.
- Bypass `syncActionResult` for changes that should update history, files, or the element list consistently.
- Merge the three canvas layers or move rendering logic into `App.tsx` without a strong architectural reason.

### Violate package boundaries

- Import `excalidraw-app` from library packages, or pull product-only APIs into `packages/excalidraw` / `packages/element`.
- Add upward dependencies (e.g. `element` → `excalidraw` runtime, `math` → `element`) beyond existing historical type imports.
- Reach across packages via long relative paths (`../../../packages/...`) when a workspace alias exists.

### Touch the wrong artifacts

- Edit generated output: `packages/excalidraw/types/`, `dist/`, `build/`, `dev-dist/`, `**/__snapshots__/`.
- Modify embedded WASM/font bindings (`woff2-bindings.ts`, `harfbuzz-bindings.ts`, `*.sfd`) unless the task is explicitly about those assets.
- Bulk-edit translation files under `locales/` except `en.json` unless localization is the task.
- Commit secrets (`.env*`), dump files (`repomix-output.xml`), or unrelated lockfile-only churn.

### Work against the monorepo

- Add `packages/**` to `.cursorignore` or otherwise hide library source from indexing.
- Assume upstream Excalidraw README, `dev-docs/`, or CONTRIBUTING still exist in this tree.
- Copy large sections from `App.tsx` (~12k lines) instead of learning from smaller action/element modules.
- Introduce new global state, event buses, or rendering paths when an existing pattern already covers the use case.
- Claim completion without running tests when TypeScript or test files were added or changed.

---

## Documentation Map

| Doc | Purpose |
|-----|---------|
| [docs/memory/projectbrief.md](docs/memory/projectbrief.md) | What the project is, layout, user flows |
| [docs/memory/techContext.md](docs/memory/techContext.md) | Stack, commands, packages |
| [docs/memory/systemPatterns.md](docs/memory/systemPatterns.md) | Actions, Scene, rendering patterns |
| [docs/technical/architecture.md](docs/technical/architecture.md) | Architecture, data flow, dependencies |
| [docs/skills-research.md](docs/skills-research.md) | Agent skills research |
| `.cursor/skills/excalidraw-verify/` | Run typecheck, tests, lint before done |
| `.cursor/skills/excalidraw-feature/` | Implement shapes, shortcuts, toolbar features |

## Spec-Driven Changes (OpenSpec)

When the repo uses OpenSpec for a change:

```bash
openspec init              # once, if openspec/ is missing
# proposal → design → tasks → spec → implement
yarn test
openspec validate --strict
openspec archive <change>
```

Helpers: `.cursor/skills/openspec-*`, `.cursor/commands/opsx-*`.
