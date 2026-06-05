# AGENTS.md — Project Rules for AI Agents

## Package import boundaries

Imports must flow strictly upward in the dependency stack. Never import from a higher-level package:

```text
math  ←  common  ←  fractional-indexing  ←  element  ←  excalidraw  ←  excalidraw-app
```

- `@excalidraw/math` imports nothing from this monorepo
- `@excalidraw/common` may only import from `@excalidraw/math` (and element types as type-only)
- `@excalidraw/element` may import from math, common, fractional-indexing
- `@excalidraw/excalidraw` may import from all packages below it
- `excalidraw-app` may import from `@excalidraw/excalidraw` and its sub-paths

**Never import from `excalidraw-app` inside a package.**

## Element mutations

Always use `mutateElement()` (`packages/element/src/mutateElement.ts`) to change element properties. Direct property assignment bypasses the Store and breaks undo/redo and collaboration sync.

## Math and geometry

Always use branded types from `packages/math/src/types.ts` (`GlobalPoint`, `LocalPoint`, `Vector`, `Radians`, etc.). Never use `{ x, y }` plain objects for coordinates in geometry code.

Utility constructors: `pointFrom(x, y)`, `vector(u, v)`, `lineSegment(a, b)` from `@excalidraw/math`.

## Keyboard shortcuts

- Key constants live in `packages/common/src/keys.ts` (`KEYS`, `CODES`)
- New shortcuts must use `matchKey(event, KEYS.X)` for layout-agnostic matching
- Register a shortcut inside the action's `keyTest` field, not in raw DOM listeners

## Adding a new action

1. Create `packages/excalidraw/actions/actionMyAction.ts`
2. Export the action created with `register({ name, perform, keyTest?, PanelComponent? })`
3. Import and re-export from `packages/excalidraw/actions/index.ts`
4. `perform()` must return `{ elements?, appState?, captureUpdate }` — never mutate arguments directly

## Test requirements

- After any change: `yarn test:app --watch=false`
- After touching types: `yarn test:typecheck`
- After touching linted files: `yarn test:code`
- Coverage thresholds: lines 60%, branches 70%, functions 63% — do not drop below these

## What the agent must NOT do

- Do not run `git push` without explicit user approval
- Do not modify `yarn.lock` manually
- Do not skip the pre-commit hook (`--no-verify`)
- Do not edit generated files under `packages/*/dist/` or `excalidraw-app/build/`
- Do not add `// eslint-disable` comments as a shortcut — fix the underlying issue

## Commands reference

```bash
yarn start                          # dev server
yarn test:app --watch=false         # run all tests once
yarn test:app path/to/file.test.ts  # single test file
yarn test:typecheck                 # TypeScript check
yarn test:code                      # ESLint
yarn fix                            # autofix formatting + lint
yarn build:packages                 # build library packages
```
