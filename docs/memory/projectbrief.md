# Project Brief

## What This Is

This repository is a **snapshot of [Excalidraw](https://excalidraw.com)** — an open-source virtual whiteboard for hand-drawn-style diagrams. It is a **TypeScript/React monorepo** that ships both:

- A **reusable editor library** (`@excalidraw/excalidraw`) that can be embedded in other apps
- A **production web app** (`excalidraw-app`) that powers excalidraw.com

The codebase uses HTML Canvas for rendering, with a hand-drawn aesthetic powered by Rough.js.

## Repository Notes

This tree is a **snapshot** of upstream Excalidraw. Some upstream docs (`README.md`, `dev-docs/`, package READMEs) may be absent — use `docs/memory/` and `docs/technical/` for structure and patterns.

Development here is **brownfield**: a large existing codebase where new work should follow established action, element, and rendering patterns.

## Repository Layout

```
excalidraw-app/     Runnable product (collab, storage, PWA, Sentry)
packages/
  common/           Shared constants, utils, event bus
  math/             2D geometry (points, vectors, curves)
  fractional-indexing/  Z-order / collab ordering strings
  element/          Element model, Scene, Store, rendering primitives
  excalidraw/       React editor UI, actions, canvases, history
  utils/            Export and helper utilities
docs/               Project and technical documentation
```

The **library** (`packages/excalidraw`) contains the core editor. The **app** (`excalidraw-app`) wraps it with product-specific features (Firebase collaboration, local persistence, share dialog, themes).

## Primary User Flows


| Flow                         | Where it lives                                                      |
| ---------------------------- | ------------------------------------------------------------------- |
| Draw shapes, lines, text     | `packages/excalidraw/components/App.tsx` + `packages/element/`      |
| Select, move, resize, rotate | Pointer handlers in `App.tsx`, element logic in `packages/element/` |
| Undo / redo                  | `packages/element/src/store.ts`, `packages/excalidraw/history.ts`   |
| Export (PNG, SVG, WebP, clipboard) | `packages/excalidraw/data/`, `packages/excalidraw/scene/export.ts` |
| Real-time collaboration      | `excalidraw-app/collab/Collab.tsx` (Firebase + Socket.io)           |
| Local save / restore         | `excalidraw-app/data/LocalData.ts`                                  |


## Constraints for Contributors

- Do **not** add `packages/**` to `.cursorignore` — library source must stay indexed (see [AGENTS.md](../../AGENTS.md)).
- Follow existing patterns: actions for undoable mutations, element factories for new shapes, canvas renderers for drawing.
- Verify AI-generated answers against actual source files before trusting them.

