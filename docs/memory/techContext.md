# Excalidraw — Tech Context

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | TypeScript | 5.9.3 |
| UI Framework | React | 19.x |
| Build Tool | Vite | 5.0.12 |
| Test Runner | Vitest | 3.0.6 |
| Canvas Rendering | Rough.js | (bundled) |
| Package Manager | Yarn Classic | 1.22.22 |
| Node Requirement | >= 18 | — |

## Monorepo Layout

```
excalidraw-app/          # Standalone web application (excalidraw.com)
packages/
  common/                # Shared utilities, constants, event bus
  math/                  # 2D geometry primitives (Point, Vector, Curve, etc.)
  element/               # Element types, creation, mutation, Scene, Store
  excalidraw/            # Core editor: App component, actions, renderer, UI
  fractional-indexing/   # Conflict-free z-order for multiplayer
  utils/                 # Export helpers (PNG, SVG, Canvas), bounding boxes
```

Workspaces are declared in root `package.json` (`"workspaces"` field).
TypeScript path aliases (`@excalidraw/math`, `@excalidraw/element`, etc.) are
configured in root `tsconfig.json`.

## Key Commands

```bash
yarn install              # Install all dependencies
yarn start                # Dev server (excalidraw-app, Vite)
yarn test:app             # Unit/integration tests (Vitest)
yarn test:typecheck       # TypeScript type-check (tsc --noEmit)
yarn test:code            # ESLint (zero warnings allowed)
yarn test:other           # Prettier format check
yarn test:all             # All of the above
yarn build:app            # Production build of the web app
yarn build:packages       # Build all library packages (ESM)
yarn fix                  # Auto-fix lint + formatting
```

## Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | Root TS config with path aliases |
| `vitest.config.mts` | Test runner configuration |
| `.eslintrc.json` | Linting rules |
| `.lintstagedrc.js` | Pre-commit lint-staged config |
| `.husky/` | Git hooks (pre-commit) |
| `vercel.json` | Deployment rewrites |
| `Dockerfile` | Container build |
| `crowdin.yml` | i18n translation management |

## Dependencies Worth Noting

- **No Redux** — state lives in `App` class component (`this.state: AppState`)
- **Jotai** — used in `excalidraw-app` for app-level atoms (collaboration, dialogs)
- **Firebase** — optional backend for collaboration/sharing
- **Sentry** — error tracking in production
- **PWA** — `vite-plugin-pwa` for offline support
