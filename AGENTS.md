# Project Rules — Excalidraw Monorepo

## Identity

This is the Excalidraw monorepo — an open-source whiteboarding/drawing tool. Yarn workspaces with 6 packages + excalidraw-app.

## Package Dependency DAG (strict — no reverse imports)

```
@excalidraw/common  →  @excalidraw/math  →  @excalidraw/element  →  @excalidraw/excalidraw  →  excalidraw-app
@excalidraw/fractional-indexing  →  @excalidraw/element
```

- Packages must NOT import from packages at the same or higher level
- Use package names for internal imports (e.g. `@excalidraw/element`), not relative paths

## Key Commands

| Command               | Purpose                   |
| --------------------- | ------------------------- |
| `yarn start`          | Dev server (port 3001)    |
| `yarn test`           | Run Vitest (watch mode)   |
| `yarn test:all`       | Typecheck + lint + tests  |
| `yarn test:coverage`  | Tests with coverage       |
| `yarn build:packages` | Build all shared packages |
| `yarn fix`            | Auto-format + lint fix    |

## Code Conventions

- **Language**: TypeScript 5.9, strict mode
- **React**: App is a class component; prefer functional components with hooks elsewhere
- **State**: Jotai for UI state, React Context for editor state (AppState, elements, API)
- **Canvas**: roughjs for hand-drawn rendering, Canvas 2D API
- **Elements**: Use `mutateElement()` (not direct mutation) — bumps version automatically
- **File naming**: `camelCase.ts` for utilities, `PascalCase.tsx` for components
- **Testing**: Vitest with jsdom, `vitest-canvas-mock`, co-located `.test.ts` files
- **No circular dependencies** — verify with `yarn test:typecheck`

## Context Boundaries

- `.cursorignore` in root excludes: node_modules, dist, build, locales, fonts, public, coverage, scripts, .github, firebase-project, lockfiles, snapshots
- Do NOT browse `node_modules/`, `**/dist/`, `**/build/`, or locale JSON files
- Focus on source in `packages/*/src/` and `excalidraw-app/`
