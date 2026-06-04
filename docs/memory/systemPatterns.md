# System Patterns

Patterns to follow when editing this codebase. Always verify against source before applying. Enforced in [AGENTS.md](../../AGENTS.md).

## Split State Model

Core editor state is **not** stored in Jotai. There are three primary state layers plus peripheral Jotai stores:

| Layer | Location | Holds |
|-------|----------|-------|
| **AppState** | `App.state` in `packages/excalidraw/components/App.tsx`; defaults in `packages/excalidraw/appState.ts` | Active tool, zoom, scroll, selection UI, theme, grid, editing flags |
| **Scene** | `packages/element/src/Scene.ts` | Ordered element list, element maps, selection helpers, mutation notifications |
| **Store** | `packages/element/src/store.ts` | Undo/redo stack, element/app-state deltas, `CaptureUpdateAction` scheduling |
| **Editor Jotai** | `packages/excalidraw/editor-jotai.ts` | Library UI atoms (color picker, library menu, TTD dialog, sidebar) |
| **App Jotai** | `excalidraw-app/app-jotai.ts` | Product atoms (collab, share dialog, language, localStorage quota) |

**Rule:** Do not move drawing state into Jotai. Jotai is for peripheral UI and app chrome only.

### CaptureUpdateAction

Defined in `packages/element/src/store.ts`:

- `IMMEDIATELY` — undoable right away (most local edits)
- `NEVER` — never recorded (remote updates, scene init)
- `EVENTUALLY` — deferred capture (multi-step async operations like dragging)

Every action returns `captureUpdate` in its `ActionResult`.

## Action System

All undoable mutations should go through the action system.

```
actions/*.ts  →  register(action)     [packages/excalidraw/actions/register.ts]
                      ↓
App constructor  →  actionManager.registerAll(actions)
                      ↓
User input  →  ActionManager.executeAction(action, source, value)
                      ↓
action.perform(elements, appState, formData, app)  →  ActionResult
                      ↓
App.syncActionResult(actionResult)   [packages/excalidraw/components/App.tsx ~2772]
```

Key files:

- Contract: `packages/excalidraw/actions/types.ts` (`ActionResult`, `ActionSource`)
- Manager: `packages/excalidraw/actions/manager.tsx`
- Barrel: `packages/excalidraw/actions/index.ts`

`syncActionResult` applies patches in order:

1. `store.scheduleAction(captureUpdate)`
2. `scene.replaceAllElements(...)` if elements changed
3. Image cache updates if files changed
4. `setState(...)` merge if appState changed
5. `scene.triggerUpdate()` otherwise

Ephemeral pointer moves (dragging, resizing) often mutate elements directly via `scene.mutateElement`, then commit with `actionFinalize` on pointer up (`packages/excalidraw/actions/actionFinalize.tsx`).

## Element System

| Concern | File |
|---------|------|
| Element types | `packages/element/src/types.ts` |
| Create new elements | `packages/element/src/newElement.ts` |
| Mutate elements | `packages/element/src/mutateElement.ts` |
| Z-order / collab indices | `packages/element/src/fractionalIndex.ts` |
| Canvas drawing | `packages/element/src/renderElement.ts` |
| Arrow bindings | `packages/element/src/binding.ts` |
| Linear element editing | `packages/element/src/linearElementEditor.ts` |

Elements have a dual ordering model: array position (cached z-order) plus a `FractionalIndex` field for collaboration reconciliation.

## Rendering Pipeline

Three canvas layers, orchestrated from `App.tsx`:

| Canvas | Component | Renderer |
|--------|-----------|----------|
| Static | `packages/excalidraw/components/canvases/StaticCanvas.tsx` | `packages/excalidraw/renderer/staticScene.ts` |
| Interactive | `packages/excalidraw/components/canvases/InteractiveCanvas.tsx` | `packages/excalidraw/renderer/interactiveScene.ts` |
| New element | `packages/excalidraw/components/canvases/NewElementCanvas.tsx` | `packages/excalidraw/renderer/renderNewElementScene.ts` |

Render trigger chain:

```
scene.onUpdate  →  App.triggerRender()
                      ↓
Renderer.getRenderableElements()   [packages/excalidraw/scene/Renderer.ts]
  (viewport culling via isElementInViewport)
                      ↓
renderStaticScene / renderInteractiveScene
                      ↓
renderElement(element, ...)   [packages/element/src/renderElement.ts]
```

## Where to Add Features

| Capability | Primary locations |
|------------|-------------------|
| New primitive shape | `packages/element/src/newElement.ts`, `renderElement.ts`, toolbar in `packages/excalidraw/components/` |
| New keyboard shortcut | `packages/excalidraw/keys.ts`, new action in `packages/excalidraw/actions/` |
| Toolbar option | `packages/excalidraw/components/` (e.g. `Actions.tsx`, tool buttons) |
| New export format | `packages/excalidraw/data/`, `packages/excalidraw/scene/export.ts` |
