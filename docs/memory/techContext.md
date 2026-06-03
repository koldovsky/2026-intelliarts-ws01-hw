# Tech Context

## Stack

- **Language:** TypeScript 5.9
- **UI:** React 19, Jotai (atom state)
- **Build:** Vite 5 (app), tsc (packages ESM)
- **Test:** Vitest 3 + jsdom + vitest-canvas-mock
- **Lint/Format:** ESLint (react-app config) + Prettier
- **Monorepo:** Yarn 1 workspaces
- **Deployment:** Vercel (app) + Firebase (collab backend)

## Yarn Commands

| Command | What it does |
|---|---|
| `yarn start` | Dev server for excalidraw-app |
| `yarn test` | Run Vitest test suite |
| `yarn test:typecheck` | `tsc` full type check |
| `yarn test:all` | typecheck + lint + format + tests |
| `yarn build:packages` | Build all packages in dependency order |
| `yarn build` | Build excalidraw-app for production |
| `yarn fix` | Auto-fix lint + format |

## packages/ overview

| Package | NPM name | Role |
|---|---|---|
| `excalidraw` | `@excalidraw/excalidraw` | Core library: App component, actions, renderer, hooks |
| `element` | `@excalidraw/element` | Element types, mutation, bounds, Scene, Store |
| `common` | `@excalidraw/common` | Constants, utils, emitter, keys, color palette |
| `math` | `@excalidraw/math` | Points, vectors, curves, geometry primitives |
| `fractional-indexing` | `@excalidraw/fractional-indexing` | Ordered indices for collaborative sorting |
| `utils` | `@excalidraw/utils` | Generic helpers (no geometry) |