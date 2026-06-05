# Tech Context

## Stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5.x |
| UI framework | React 19 (functional components + hooks) |
| Build tool | Vite 5 |
| Package manager | Yarn 1 (classic) workspaces |
| Test runner | Vitest 3 + jsdom + vitest-canvas-mock |
| Linter | ESLint (custom `@excalidraw/eslint-config`) |
| Formatter | Prettier (`@excalidraw/prettier-config`) |
| State (local) | Jotai 2 with jotai-scope isolation |
| Collaboration | socket.io-client + Firebase 11 |
| Rendering | Canvas 2D API + roughjs for hand-drawn style |
| Deployment | Vercel (app) + PWA (vite-plugin-pwa) |

## Key yarn commands (run from repo root)

```bash
yarn start                      # dev server for excalidraw-app
yarn test:app                   # vitest (watch mode)
yarn test:app --watch=false     # vitest single run
yarn test:app path/to/file.ts   # single file
yarn test:all                   # typecheck + eslint + prettier + vitest
yarn test:typecheck             # tsc only
yarn test:code                  # eslint only
yarn fix                        # prettier + eslint autofix
yarn build:packages             # build all library packages (needed before examples)
yarn build                      # build excalidraw-app for production
```

## Monorepo workspace layout

```
repo/
  packages/
    math/               @excalidraw/math        — geometric primitives
    common/             @excalidraw/common       — shared utils, constants, colors
    fractional-indexing/ @excalidraw/fractional-indexing — element ordering
    element/            @excalidraw/element      — element types, Scene, Store, deltas
    excalidraw/         @excalidraw/excalidraw   — main React component + editor
    utils/              @excalidraw/utils        — public helper exports
  excalidraw-app/       deployed web app (collab, Firebase, PWA, Sentry)
  examples/             embedding examples
```

## Path aliases in tests (vitest.config.mts)

Package names like `@excalidraw/common` resolve directly to `packages/common/src/index.ts` during tests — no build step needed.

## Node requirement

Node >= 18.0.0