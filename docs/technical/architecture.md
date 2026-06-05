# High-Level Architecture

## Overview

Excalidraw is a monorepo of layered TypeScript packages that together form both a reusable React component library (`@excalidraw/excalidraw`) and a deployed PWA (`excalidraw-app`).

```
┌─────────────────────────────────────────────────────┐
│                   excalidraw-app                    │
│   (PWA, Firebase collab, Sentry, user storage)      │
└────────────────────┬────────────────────────────────┘
                     │ consumes
┌────────────────────▼────────────────────────────────┐
│           @excalidraw/excalidraw                    │
│   (App.tsx, actions, renderer, history, i18n)       │
└──────┬───────────────────────────────────┬──────────┘
       │                                   │
┌──────▼──────┐                   ┌────────▼────────┐
│ @excalidraw │                   │ @excalidraw     │
│  /element   │                   │  /common        │
│ (Scene,     │                   │ (constants,     │
│  Store,     │                   │  utils, colors, │
│  delta,     │                   │  emitter)       │
│  element    │                   └────────┬────────┘
│  types)     │                            │
└──────┬──────┘                            │
       │                                   │
┌──────▼───────────────────────────────────▼──────────┐
│                  @excalidraw/math                    │
│   (GlobalPoint, LocalPoint, Vector, Curve, etc.)    │
└─────────────────────────────────────────────────────┘

         @excalidraw/fractional-indexing
         (stable element ordering for collab)
```

## Package Dependencies

| Package | Depends on |
|---|---|
| `@excalidraw/math` | nothing |
| `@excalidraw/common` | `@excalidraw/math`, `@excalidraw/element/types` (type-only) |
| `@excalidraw/fractional-indexing` | `@excalidraw/common` |
| `@excalidraw/element` | `@excalidraw/math`, `@excalidraw/common`, `@excalidraw/fractional-indexing` |
| `@excalidraw/excalidraw` | all of the above |
| `excalidraw-app` | `@excalidraw/excalidraw` (and its sub-paths) |

Import direction is strictly bottom-up — lower packages never import from higher ones.

## Data Flow

### User interaction

```
Pointer/keyboard event
  → App.tsx event handler
    → ActionManager.executeAction(action, elements, appState)
      → action.perform() returns { elements?, appState? }
        → Store.captureIncrement(CaptureUpdateAction.IMMEDIATELY)
          → StoreDelta computed from diff
            → History.record(delta)
        → Scene updated
        → React re-render triggered
          → staticScene re-drawn (if elements changed)
          → interactiveScene re-drawn (always on pointer move)
```

### Collaboration sync

```
Local change
  → Store emits onChange
    → Collab.tsx throttled broadcast
      → socket.io → server → peers

Remote message received
  → Collab.tsx handler
    → decryptData(payload)
      → reconcileElements(local, remote, appState)
        → shouldDiscardRemoteElement() per element
      → excalidrawAPI.updateScene(reconciledElements)
```

## State Management

Two complementary state stores coexist:

**React / Jotai atoms** — UI state not tied to the canvas document:
- Editor atoms: `packages/excalidraw/editor-jotai.ts` (scoped per `<Excalidraw>` instance via `jotai-scope`)
- App atoms: `excalidraw-app/app-jotai.ts` (collab status, language, etc.)

**AppState (plain object)** — editor document state: active tool, selection, zoom, scroll, open dialogs, theme. Passed through React renders and tracked by the Store for undo/redo diffing via `ObservedAppState`.

**Scene (SceneElementsMap)** — the canonical `Map<id, ExcalidrawElement>` of all canvas elements. Mutated only via `mutateElement()` so version tracking stays consistent.

## Rendering Pipeline

```
Scene.getElements()
  │
  ├─► staticScene renderer (Canvas 2D + roughjs)
  │     • Runs only when elements or theme change
  │     • Draws every non-deleted element using roughjs for sketch style
  │     • Result cached on offscreen canvas
  │
  └─► interactiveScene renderer (Canvas 2D)
        • Runs on every pointer move
        • Draws selection boxes, transform handles, snapping guides,
          in-progress new element, remote cursors
```

SVG export (`renderer/staticSvgScene.ts`) replicates the static scene as an SVG document, walking the same element list with SVG equivalents of each shape.

## Key Subsystems

### Element system

- All shapes are subtypes of `ExcalidrawElement` (`packages/element/src/types.ts`)
- Mutations go through `mutateElement()` — never direct property assignment
- Element order is maintained by fractional indices, stable under concurrent insertions

### Store + Delta + History

- `Store` observes every `mutateElement` call and computes `StoreDelta` diffs
- `CaptureUpdateAction.IMMEDIATELY / EVENTUALLY / NEVER` controls undo granularity
- `HistoryDelta.applyTo()` replays changes forward or backward without touching `version`/`versionNonce`

### Action system

- Each user operation is a registered `Action` object
- Actions declare their own keyboard bindings and optional panel UI component
- `ActionManager` is the single dispatch point, keeping App.tsx decoupled from individual operations

### Collaboration

- `excalidraw-app/collab/Collab.tsx` owns the socket.io lifecycle
- Rooms are end-to-end encrypted (AES-GCM); the server is a relay only
- `reconcileElements()` resolves conflicts using last-write-wins with an exception: elements being actively edited locally are never overwritten by remote