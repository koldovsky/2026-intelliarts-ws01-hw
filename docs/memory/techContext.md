# Tech Context

Agent rules: [AGENTS.md](../../AGENTS.md). Architecture: [architecture.md](../technical/architecture.md).

## Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript 5.9 |
| UI | React 19 |
| Bundler | Vite 5 |
| Testing | Vitest, jsdom |
| Package manager | Yarn 1 workspaces |
| Drawing | Rough.js (hand-drawn canvas strokes) |
| Peripheral UI state | Jotai (sidebar, dialogs, collab chrome — **not** core editor state) |
| Collab (app only) | Firebase, Socket.io |
| Error tracking (app only) | Sentry |

## Prerequisites

- **Node.js** >= 18 (22+ recommended)
- **Yarn** 1.22.x (declared in root `package.json` as `packageManager`)

## Yarn Commands

Run all commands from the **repository root**:

```bash
yarn install          # install all workspace dependencies
yarn start            # dev server via excalidraw-app (Vite, port from VITE_APP_PORT or 3000)
yarn build            # production build of excalidraw-app
yarn build:packages   # build libraries in dependency order
yarn test             # run Vitest test suite
yarn test:all         # typecheck + eslint + prettier + tests
yarn test:typecheck   # tsc only
yarn test:code        # eslint only
yarn fix              # auto-fix prettier + eslint issues
yarn start:production # build + serve on localhost:5001
```

Build order for libraries (from root `package.json` scripts):

```text
build:common → build:fractional-indexing → build:math → build:element → build:excalidraw
```

## Packages

| Package | Path | Role |
|---------|------|------|
| `@excalidraw/common` | `packages/common/` | Shared constants, colors, keys, utils, `appEventBus`, `editorInterface` |
| `@excalidraw/fractional-indexing` | `packages/fractional-indexing/` | Vendored fractional-index strings for z-order and collaboration |
| `@excalidraw/math` | `packages/math/` | 2D geometry: points, vectors, segments, curves, ellipses |
| `@excalidraw/element` | `packages/element/` | Element types, `Scene`, `Store`, mutations, `renderElement`, bindings |
| `@excalidraw/excalidraw` | `packages/excalidraw/` | React editor: `App` class, actions, canvases, history, i18n |
| `@excalidraw/utils` | `packages/utils/` | Export helpers (shape utilities, compression) |
| `excalidraw-app` | `excalidraw-app/` | Product shell: collab, local storage, share, PWA, Sentry |

## Package Dependencies

```text
fractional-indexing (standalone)
common (tinycolor2)
  └── math
        └── element (+ fractional-indexing)
              └── excalidraw (+ UI deps: roughjs, jotai-scope, radix-ui, etc.)
                    └── excalidraw-app (+ firebase, sentry, socket.io)
utils — sibling helper package, re-exported from excalidraw
```

## Development Setup

During development, `excalidraw-app/vite.config.mts` maps `@excalidraw/*` imports to `packages/*/src` (or `packages/excalidraw/index.tsx`), so the app runs against **source files** rather than pre-built `dist/` artifacts.

Entry points:

- App bootstrap: `excalidraw-app/index.tsx` → `excalidraw-app/App.tsx`
- Library export: `packages/excalidraw/index.tsx` → `<Excalidraw />` component

## Workspaces

Root `package.json` workspaces:

```json
["excalidraw-app", "packages/*", "examples/*"]
```
