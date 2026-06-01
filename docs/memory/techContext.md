# Tech Context — Excalidraw

## Stack

- **Language:** TypeScript `5.9.3`
- **UI:** React `19` (`@types/react` 19.0.10)
- **Bundler/dev:** Vite `5.0.12` (+ plugins: react, svgr, pwa, checker, ejs)
- **Tests:** Vitest `3` (jsdom env, `vitest-canvas-mock`), globals enabled
- **Lint/format:** ESLint (`@excalidraw/eslint-config`) + Prettier
- **State:** Jotai (see `packages/excalidraw/editor-jotai.ts`)
- **Node:** `>=18`

## Package manager & workspace

- **Yarn `1.22.22`** (classic). Workspaces:
  - `excalidraw-app` — hosted reference app (collaboration, PWA)
  - `packages/*` — the publishable editor + libraries
  - `examples/*` — integration examples (removed in this WS1 snapshot)

## Packages

| Package | Role |
|---|---|
| `@excalidraw/common` | Shared utils: keys, colors, points, constants |
| `@excalidraw/math` | Geometry / math primitives |
| `@excalidraw/element` | Element model: bounds, collision, binding, Scene |
| `@excalidraw/excalidraw` | The editor: components, actions, data, rendering |
| `@excalidraw/utils` | Misc utilities |
| `@excalidraw/fractional-indexing` | Z-order via fractional indices |

## Key commands

```bash
yarn install            # install workspace deps
yarn start              # dev server (excalidraw-app)
yarn build              # production build of the app
yarn build:packages     # build all publishable packages (esm)
yarn test               # vitest (unit tests)
yarn test:typecheck     # tsc (no emit)
yarn test:code          # eslint (max-warnings=0)
yarn fix                # prettier --write + eslint --fix
```

> Verified against root `package.json` during WS1 onboarding.
