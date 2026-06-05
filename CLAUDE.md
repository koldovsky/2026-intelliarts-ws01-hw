# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root (`/Volumes/data/projects/2026-intelliarts-ws01-hw/repo`).

```bash
# Dev server
yarn start

# Run tests (vitest, watch mode by default)
yarn test:app

# Run a single test file
yarn test:app packages/excalidraw/data/library.test.ts

# Run tests without watch
yarn test:app --watch=false

# Run all checks (typecheck + eslint + prettier + tests)
yarn test:all

# Typecheck only
yarn test:typecheck

# Lint
yarn test:code

# Lint with autofix
yarn fix:code

# Format (prettier)
yarn fix:other

# Build the app
yarn build

# Build all packages (needed before running examples)
yarn build:packages

# Clean build artifacts
yarn rm:build
```

## Monorepo Structure

This is a Yarn workspaces monorepo. The packages have a layered dependency order:

```
@excalidraw/math          – geometric primitives (Point, Vector, Line, Curve, etc.)
@excalidraw/common        – shared constants, utilities, types (no element knowledge)
@excalidraw/element       – element types, mutation, Scene, Store, delta/history
@excalidraw/excalidraw    – the main React component and editor (App.tsx, actions, renderer)
excalidraw-app            – the deployed web app (collab, Firebase, Sentry, PWA)
```

`packages/*/src/` is the source for each library package. `packages/excalidraw/` is flat (no `src/` subdirectory).

## Key Architecture Concepts

**Element Store & Deltas** (`packages/element/src/store.ts`, `delta.ts`): Elements are mutated via `mutateElement` and tracked by a `Store`. Changes are represented as `StoreDelta` (an `ElementsDelta` + `AppStateDelta`) using the `CaptureUpdateAction` enum:
- `IMMEDIATELY` — captured for undo/redo
- `EVENTUALLY` — batched, undoable as a group
- `NEVER` — ephemeral (dragging, resizing in progress)

**Scene** (`packages/element/src/Scene.ts`): Holds the canonical `SceneElementsMap`. All element reads/writes go through `Scene`; fractional indices keep element order stable across collaboration.

**Renderer** (`packages/excalidraw/renderer/`): Two canvas layers — `staticScene` (all non-selected elements, rarely re-rendered) and `interactiveScene` (selection, handles, in-progress drawing). SVG export lives in `staticSvgScene.ts`.

**Actions** (`packages/excalidraw/actions/`): Each action is registered via `register.ts` and processed by `ActionManager`. Actions receive `elements`, `appState`, and `app` and return updated state.

**History** (`packages/excalidraw/history.ts`): `HistoryDelta` extends `StoreDelta`. Undo/redo applies deltas to elements and `AppState` without touching `version`/`versionNonce` (so undo is treated as a new user action by collaborators).

**Collaboration** (`excalidraw-app/collab/`): `Collab` (PureComponent) connects via `socket.io`. Remote elements are reconciled with `reconcileElements` from `packages/excalidraw/data/reconcile.ts` using `shouldDiscardRemoteElement` rules. Encrypted rooms use `encryptData`/`decryptData`.

**State management**: Jotai atoms with scoped isolation (`jotai-scope`) via `EditorJotaiProvider` and `editorJotaiStore`. The editor's atoms live in `packages/excalidraw/editor-jotai.ts`; app-level atoms in `excalidraw-app/app-jotai.ts`.

**App component** (`packages/excalidraw/components/App.tsx`): ~13 000 lines. The central class handles all pointer events, tool state, and coordinates between Scene, Store, History, and Renderer.

## TypeScript / Coding Conventions

- **Math types**: Always use branded types from `packages/math/src/types.ts` (`GlobalPoint`, `LocalPoint`, `Vector`, `Radians`, etc.) instead of `{ x, y }` plain objects. Import `pointFrom`, `vector`, etc. from `@excalidraw/math`.
- **Immutability**: Prefer `const` / `readonly`. Use `mutateElement` (not direct property assignment) to update elements so the Store can track changes.
- **Performance**: Prefer allocations-free paths. Trade RAM for fewer CPU cycles when there is a clear choice.
- Use optional chaining (`?.`) and nullish coalescing (`??`).
- CSS modules for component styling; global styles in `packages/excalidraw/css/`.

## Testing

Tests use Vitest with `jsdom` + `vitest-canvas-mock`. Coverage thresholds: lines 60%, branches 70%, functions 63%. After making changes, run `yarn test:app` and fix any reported failures.