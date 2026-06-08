# Tech Context

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Language | TypeScript | 5.9.3 |
| UI | React + React-DOM | 19.0.0 |
| Bundler (app) | Vite | 5.0.12 |
| Bundler (packages) | Custom esbuild scripts | — |
| State management | Jotai | 2.11.0 |
| Drawing engine | RoughJS | 4.6.4 |
| Stroke smoothing | perfect-freehand | 1.2.0 |
| UI primitives | Radix-UI | 1.4.3 |
| Real-time collab | Socket.io-client | 4.7.2 |
| Cloud backend | Firebase (Firestore + Storage) | 11.3.1 |
| Offline storage | idb-keyval (IndexedDB) | 6.0.3 |
| Code editor | CodeMirror 6 | 6.x |
| Diagram import | @excalidraw/mermaid-to-excalidraw | 2.2.2 |
| Error tracking | Sentry | 9.0.1 |
| Testing | Vitest + jsdom | 3.0.6 |
| Linting | ESLint | 7.32.2 |
| Formatting | Prettier | 2.6.2 |
| Git hooks | Husky + lint-staged | 7.0.4 / 12.3.7 |

---

## Package Manager & Monorepo Setup

- **Package manager:** `yarn` 1.22.22 (classic)
- **Monorepo:** Yarn workspaces — defined in root `package.json`
  ```json
  "workspaces": ["excalidraw-app", "packages/*", "examples/*"]
  ```
- **`.npmrc`:** `save-exact=true`, `legacy-peer-deps=true`
- **Node requirement:** `>=18.0.0`

---

## CLI Commands

All commands run from the **monorepo root** with `yarn`.

### Install
```bash
yarn                    # install all workspace dependencies
yarn clean-install      # rm node_modules everywhere + reinstall
```

### Development
```bash
yarn start              # Vite dev server on port 3001 (auto-opens browser)
yarn start:production   # build then serve locally
```

### Build
```bash
yarn build              # build app + generate version info
yarn build:app          # Vite production build → excalidraw-app/build/
yarn build:packages     # build all packages in dependency order
yarn build:excalidraw   # build @excalidraw/excalidraw package only
yarn build:element      # build @excalidraw/element package only
yarn build:common       # build @excalidraw/common package only
yarn build:math         # build @excalidraw/math package only
yarn build:fractional-indexing
yarn build:app:docker   # Vite build with Sentry disabled (CI use)
```

### Test
```bash
yarn test               # Vitest in watch mode
yarn test:app           # Vitest (no watch)
yarn test:all           # typecheck + lint + prettier + vitest (full CI suite)
yarn test:typecheck     # tsc type check only
yarn test:code          # ESLint (max-warnings=0)
yarn test:other         # Prettier diff check
yarn test:coverage      # Vitest with coverage report
yarn test:update        # update snapshots
```

### Lint & Format
```bash
yarn fix                # ESLint --fix + Prettier --write (all applicable files)
yarn fix:code           # ESLint --fix only
yarn fix:other          # Prettier --write (CSS, SCSS, JSON, MD, HTML, YAML)
```

### Cleanup
```bash
yarn rm:build           # delete all build/dist/dev-dist outputs
yarn rm:node_modules    # delete all node_modules directories
```

---

## Workspace Packages

| Package | Path | Role |
|---|---|---|
| `@excalidraw/common` | `packages/common/` | Shared constants, MIME types, color utils, geometry helpers |
| `@excalidraw/math` | `packages/math/` | Vector/matrix/geometry math operations |
| `@excalidraw/fractional-indexing` | `packages/fractional-indexing/` | Multiplayer element ordering (prevents conflicts) |
| `@excalidraw/element` | `packages/element/` | Element types, mutation, binding, bounds, delta, collision |
| `@excalidraw/utils` | `packages/utils/` | File I/O, export, URL safety, image processing |
| `@excalidraw/excalidraw` | `packages/excalidraw/` | Core React component + all drawing/action/store logic |
| `excalidraw-app` | `excalidraw-app/` | Deployed web application (Vite SPA) |

**Build order matters:** `common` → `math` → `fractional-indexing` → `element` → `excalidraw`

---

## Key Configuration Files

| File | Purpose |
|---|---|
| `package.json` | Root workspace definition, all scripts |
| `tsconfig.json` | Shared TS config; path aliases `@excalidraw/*` → `packages/*/src` |
| `excalidraw-app/vite.config.mts` | Vite build config (plugins, code splitting, PWA, EJS, SVGR) |
| `vitest.config.mts` | Test config (jsdom, globals, coverage thresholds) |
| `.eslintrc.json` | ESLint rules (import ordering, no-direct-jotai, etc.) |
| `.prettierrc` | Prettier config (via `@excalidraw/prettier-config`) |
| `.lintstagedrc.js` | Pre-commit: ESLint on JS/TS, Prettier on CSS/SCSS/JSON/MD |
| `.husky/pre-commit` | Runs `yarn lint-staged` before every commit |
| `firebase.json` | Firebase hosting + Firestore + Storage deployment targets |
| `firebase-project/firestore.rules` | Firestore security rules |
| `firebase-project/storage.rules` | Firebase Storage security rules |
| `.env.development` | Local dev env vars (Firebase config, backend URLs, port) |
| `.env.production` | Production env vars |

---

## Important Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_APP_FIREBASE_CONFIG` | Firebase project config JSON |
| `VITE_APP_WS_SERVER_URL` | Socket.io server URL for collaboration |
| `VITE_APP_BACKEND_V2_GET_URL` | GET endpoint for JSON link sharing |
| `VITE_APP_BACKEND_V2_POST_URL` | POST endpoint for JSON link sharing |
| `VITE_APP_AI_BACKEND` | Backend URL for AI features |
| `VITE_APP_PORT` | Dev server port (default: 3001) |

---

## Development Notes for AI Agents

- **Never import directly from `jotai`** in `excalidraw-app/` — use `excalidraw-app/app-jotai.ts` instead. ESLint enforces this.
- **Never import directly from `jotai`** in `packages/excalidraw/` — use the internal `editor-jotai` module.
- **`packages/**` is source code**, not generated — do not treat it as ignorable.
- All packages output **ESM only** — no CommonJS.
- **Build packages before building the app** if you modified package source (`yarn build:packages && yarn build:app`).
- **Vite dev server** (`yarn start`) uses HMR and resolves `@excalidraw/*` via TypeScript path aliases (no need to pre-build packages in dev mode).
- **`save-exact=true`** is in `.npmrc` — all dependency versions are pinned. Do not add floating version ranges.
- **React 19** is used — avoid patterns deprecated in React 19 (e.g., `findDOMNode`).
- **Pre-commit hooks** run ESLint + Prettier automatically; failing lint will block commits.
- **Vitest coverage thresholds**: lines ≥60%, branches ≥70%, functions ≥63%, statements ≥60%. Dropping below blocks CI.
