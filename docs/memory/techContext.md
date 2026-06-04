# Tech context

> Memory Bank file. The stack, the package manager commands, and the workspace layout - the things you need before touching the code.

## Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Language | TypeScript 5.9 | strict mode via root `tsconfig.json` |
| UI | React 19 | the editor is a single class component, `App` |
| Rendering | HTML canvas + RoughJS | RoughJS gives the hand-drawn look |
| Build | Vite 5 | per-package ESM builds + the app build |
| Tests | Vitest 3 | jsdom + `vitest-canvas-mock`, config in `vitest.config.mts` |
| Lint / format | ESLint + Prettier 2.6 | `@excalidraw/eslint-config`, `@excalidraw/prettier-config` |
| State (app shell) | Jotai | only in `excalidraw-app/`, for collab UI atoms |
| Backend (app) | Firebase | collab room storage + image files |
| Package manager | Yarn 1 (classic) | `packageManager: yarn@1.22.22`, workspaces |

Node: both `package.json` files declare `engines.node >= 18`. The workshop setup asks for Node 22+, so target 22.

## Monorepo layout

Yarn workspaces (`package.json:5-9`): `excalidraw-app`, `packages/*`, `examples/*`. The `examples/` directory is not present in this snapshot; the glob just resolves to nothing.

```text
packages/
  common/              @excalidraw/common              constants, colors, keys, points, utils, random
  math/                @excalidraw/math                geometry/number helpers
  fractional-indexing/ @excalidraw/fractional-indexing vendored z-order index strings (CC0)
  element/             @excalidraw/element             element model, factories, mutation, binding, Scene
  excalidraw/          @excalidraw/excalidraw          the React editor: components, actions, renderer, data
  utils/               @excalidraw/utils               standalone export/util helpers
excalidraw-app/        excalidraw-monorepo app shell   collab, persistence, PWA, Plus export
```

Internal dependency direction (verified from each `package.json`):

```text
common            (no internal deps)
math              -> common
fractional-indexing (no internal deps)
element           -> common, math, fractional-indexing
excalidraw        -> common, element, math
utils             -> (external @excalidraw/laser-pointer only)
excalidraw-app    -> excalidraw
```

So dependencies point one way: leaf utility packages at the bottom, the editor on top, the app shell above that. Nothing under `packages/` imports from `excalidraw-app/`. Respect this when adding code - see [AGENTS.md](../../AGENTS.md) once Task 2 lands.

## Commands (run from repo root with yarn)

| Command | What it does |
| --- | --- |
| `yarn start` | dev server for the web app (`excalidraw-app`) |
| `yarn build` | production build of the web app |
| `yarn build:packages` | build all publishable packages in dependency order |
| `yarn test` | run Vitest (alias of `test:app`) |
| `yarn test:app --watch=false` | single Vitest run, no watch |
| `yarn test:update --watch=false` | update snapshot/`__snapshots__` baselines |
| `yarn test:typecheck` | `tsc` typecheck across the repo |
| `yarn test:code` | ESLint, `--max-warnings=0` |
| `yarn test:other` | Prettier check (`--list-different`) |
| `yarn test:all` | typecheck + lint + prettier + app tests |
| `yarn fix` | Prettier write + ESLint `--fix` |
| `yarn test:coverage` | Vitest with v8 coverage |

A `pre-commit` Husky hook runs `lint-staged` (`.husky/pre-commit`, `.lintstagedrc.js`), so staged files get formatted/linted on commit. Do not bypass it with `--no-verify`.

## Config files worth knowing

- `tsconfig.json` (root) + `packages/tsconfig.base.json` - shared TS config.
- `vitest.config.mts` + `setupTests.ts` - test runtime, canvas mock, matchers.
- `.eslintrc.json` / `packages/eslintrc.base.json` - lint rules.
- `.env.development` / `.env.production` - app env (Firebase keys, feature flags).
- `vite.config.mts` lives per package and in `excalidraw-app/`.
