# Excalidraw — Project Rules

## Architecture Constraints

- The main `App` component (`packages/excalidraw/components/App.tsx`) is a React
  **class component** (~13k lines). Do not attempt to convert it to a functional
  component — too much imperative canvas logic depends on instance methods.
- Elements are **plain data objects**, not class instances. All element logic
  lives in standalone functions (`packages/element/src/`). Never add methods to
  element types.
- Canvas rendering is **imperative** (Canvas 2D API + Rough.js), not
  React-managed DOM. Never use React DOM elements for drawing shapes.

## Element System Rules

- Create elements only through factory functions in `packages/element/src/newElement.ts`
  (`newElement()`, `newTextElement()`, `newArrowElement()`, etc.).
- Mutate elements only via `mutateElement()` or `newElementWith()` from
  `packages/element/src/mutateElement.ts`. Never assign properties directly.
- Deletion is **soft-delete** (`isDeleted: true`). Never remove elements from
  the array.
- All collections on elements use **readonly** / immutable arrays.
- Use `Optional` patterns — never return or assign `null` for optional fields
  that have an `Optional`-style API.

## Action System Rules

- Every user-facing operation must be an **Action** registered via `register()`
  in `packages/excalidraw/actions/`.
- Actions return `{ elements, appState }` deltas — never call `setState()`
  directly from an action's `perform()`.
- Keyboard shortcuts are declared via `keyTest` on the action, not as separate
  event listeners.

## Canvas & Rendering

- Three canvases exist: **StaticCanvas**, **InteractiveCanvas**,
  **NewElementCanvas**. Know which one your change affects.
- Static scene redraws are throttled. If you need immediate visual feedback
  during interaction, use the InteractiveCanvas or NewElementCanvas path.
- Viewport culling happens in `Renderer.getRenderableElements()` — elements
  outside the viewport are not drawn.

## Type System

- Use branded types from `@excalidraw/math` (`Radians`, `Degrees`,
  `GlobalPoint`, `LocalPoint`, `Vector`). Do not use bare `number` for
  angles or `{ x, y }` for points.
- Element maps: use `SceneElementsMap` for ordered elements,
  `NonDeletedElementsMap` for filtered views. Check
  `packages/element/src/types.ts` for the correct map type.

## Package Boundaries

```
@excalidraw/math      ← no internal deps (pure geometry)
@excalidraw/common    ← depends on math only
@excalidraw/element   ← depends on math, common, fractional-indexing
@excalidraw/excalidraw ← depends on all above
@excalidraw/utils     ← depends on element, excalidraw
excalidraw-app        ← depends on excalidraw (top-level app)
```

- Never import from a higher-level package into a lower-level one
  (e.g., `element` must not import from `excalidraw`).
- Never import from `excalidraw-app` into any library package.

## Testing

- Test runner: **Vitest** (not Jest). Config: `vitest.config.mts`.
- Run tests: `yarn test:app` (or `yarn test:app --watch=false` for CI).
- Type-check: `yarn test:typecheck`.
- Lint: `yarn test:code` (ESLint, zero warnings allowed).
- Format: `yarn test:other` (Prettier).
- All: `yarn test:all`.

## Commands

| Task | Command |
|------|---------|
| Dev server | `yarn start` |
| Run tests | `yarn test:app` |
| Type-check | `yarn test:typecheck` |
| Lint | `yarn test:code` |
| Fix lint + format | `yarn fix` |
| Build app | `yarn build:app` |
| Build packages | `yarn build:packages` |

## What NOT To Do

- Do not add new npm dependencies without justification.
- Do not use `var` — use `const` / `let`.
- Do not use `class` for new data structures — use plain objects + functions.
- Do not add React DOM elements to the canvas layer.
- Do not bypass the action system for user-facing state changes.
