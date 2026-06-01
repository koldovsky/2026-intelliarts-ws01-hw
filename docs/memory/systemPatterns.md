# System Patterns — Excalidraw

## Monorepo layering

Dependency direction (low → high level):

```
common  →  math  →  element  →  excalidraw  →  excalidraw-app
```

`common` has no app deps; `excalidraw` composes everything; `excalidraw-app`
is the shell.

## Core domain: the Element system

- An Excalidraw scene is an array of **elements** (`ExcalidrawElement`).
- `packages/element/` owns the model: `bounds.ts`, `collision.ts`,
  `binding.ts` (arrows bound to shapes), `Scene.ts`, `fractionalIndex.ts`
  (z-order), `frame.ts`, `groups.ts`.
- Elements are immutable-ish; mutations go through helpers that version them.

## Action system

- User operations are **actions** in `packages/excalidraw/actions/`
  (`actionExport.tsx`, `actionFlip.ts`, `actionDeleteSelected.tsx`, …).
- Each action declares `name`, `perform()`, optional `keyTest()` (keyboard
  binding) and `PanelComponent` (UI). An **actionManager** dispatches them.
- This is the main extension point for new shortcuts / toolbar options.

## State management

- Editor state = **`appState`** (`packages/excalidraw/appState.ts`) +
  the elements array.
- Cross-component reactive state uses **Jotai** (`editor-jotai.ts`).
- Undo/redo via `history.ts`.

## Rendering

- Elements are drawn on an HTML **canvas** (rough.js for the hand-drawn look).
- A render pipeline turns `(elements, appState)` into canvas draw calls; static
  vs interactive layers are separated for performance.

## Keyboard handling

- Key constants and matchers live in `packages/common/src/keys.ts`
  (`KEYS`, `CODES`, `matchKey` for non-latin layouts, `isArrowKey`, …).
- Actions read these in their `keyTest()`.

## Testing pattern

- Vitest with **globals** (`describe/it/expect` without imports), jsdom env.
- Unit tests are colocated (`*.test.ts(x)`); cross-package imports use the
  `@excalidraw/*` aliases (e.g. `import { rgbToHex } from "@excalidraw/common"`).

> Reverse-engineered from source during WS1 onboarding; verified against code.
