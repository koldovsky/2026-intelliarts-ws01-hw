# Excalidraw — System Patterns

## 1. Canvas Rendering (Triple-Canvas Architecture)

Excalidraw uses **three separate canvases** layered on top of each other:

- **StaticCanvas** (`packages/excalidraw/components/canvases/StaticCanvas.tsx`)
  Renders all committed elements. Redraws are throttled for performance.
- **InteractiveCanvas** (`packages/excalidraw/components/canvases/InteractiveCanvas.tsx`)
  Renders transient UI: selection boxes, resize handles, drag previews, hover states.
- **NewElementCanvas** (`packages/excalidraw/components/canvases/NewElementCanvas.tsx`)
  Renders the element currently being drawn (e.g. a rectangle mid-drag).
  Separated so only the in-progress shape redraws on every pointer move.

Each calls into a dedicated renderer (`renderer/staticScene.ts`,
`renderer/interactiveScene.ts`, `renderer/renderNewElementScene.ts`) which
iterates over elements and draws them via Rough.js (sketchy look) and the
native Canvas 2D API (selection chrome, grid).

A `Renderer` class (`packages/excalidraw/scene/Renderer.ts`) culls elements
outside the viewport before passing them to the render functions.

## 2. Element System

All drawable objects are **elements** — plain data objects (not classes).

### Type Hierarchy

Defined in `packages/element/src/types.ts`:

- **Generic shapes**: `rectangle`, `diamond`, `ellipse`
- **Linear**: `line`, `arrow`, `elbowArrow`
- **Content**: `text`, `image`, `iframe`, `embeddable`
- **Containers**: `frame`, `magicframe`

### Lifecycle: Create → Mutate → Soft-Delete

| Phase | Function | File |
|-------|----------|------|
| Create | `newElement()`, `newTextElement()`, `newArrowElement()`, etc. | `element/src/newElement.ts` |
| Mutate | `mutateElement()` (in-place) / `newElementWith()` (immutable copy) | `element/src/mutateElement.ts` |
| Delete | Set `isDeleted: true` | soft-delete, never removed from array |

Every mutation bumps `version` and regenerates `versionNonce` — used for
deterministic conflict resolution in multiplayer.

### Relationships Between Elements

- `boundElements` — arrows/text attached to a shape
- `containerId` — text element inside a container (rectangle, diamond, etc.)
- `frameId` — element belongs to a frame
- `groupIds[]` — nested group membership

## 3. Action System

All user-initiated mutations go through the **Action System**.

### Structure

Each action is an object implementing the `Action` interface
(`packages/excalidraw/actions/types.ts`):

```
{
  name: ActionName,
  keyTest?: (event) => boolean,       // keyboard shortcut
  perform: (elements, appState, formData, app) => ActionResult,
  PanelComponent?: React.FC,          // optional toolbar UI
}
```

### Flow

1. Actions are registered via `register()` (`actions/register.ts`)
2. `ActionManager` (`actions/manager.tsx`) holds the registry
3. On keyboard/click → `actionManager.handleKeyDown()` or `executeAction()`
4. `perform()` returns `{ elements, appState, files }` deltas
5. `App.setState()` applies the result → triggers re-render

There are ~70 registered actions (71 `register()` calls across 34 files)
covering shapes, properties, canvas operations, clipboard, history, export,
alignment, and more.

## 4. State Management (`AppState`)

The central state object is `AppState` (defined in
`packages/excalidraw/appState.ts`). It contains:

- **Tool state**: `activeTool`, current item defaults (color, fill, font, etc.)
- **Viewport**: `zoom`, `scrollX`, `scrollY`, `width`, `height`
- **Selection**: `selectedElementIds`, `selectedGroupIds`
- **UI flags**: `openMenu`, `openDialog`, `openSidebar`, `viewModeEnabled`
- **Editing**: `editingTextElement`, `newElement` (being drawn)

State lives in `App` (a React class component, ~13k lines in
`packages/excalidraw/components/App.tsx`). It is distributed to children via
multiple React contexts:

- `ExcalidrawAppStateContext` — full appState
- `ExcalidrawElementsContext` — element array
- `ExcalidrawActionManagerContext` — action manager
- `ExcalidrawSetAppStateContext` — setState function

## 5. Scene & Store

- **Scene** (`packages/element/src/Scene.ts`) — manages the element collection,
  provides queries (`getSelectedElements()`, `getNonDeletedElements()`), and
  maintains element maps for O(1) lookup by ID.
- **Store** (`packages/element/src/store.ts`) — captures element snapshots for
  change tracking, undo/redo integration.
- **History** — undo/redo stack built on top of Store deltas.

## 6. Collaboration Model

- Elements use **fractional indexing** (`packages/fractional-indexing/`) for
  z-order so inserts between elements don't require re-indexing.
- `version` + `versionNonce` on every element enable last-writer-wins
  reconciliation.
- `excalidraw-app/collab/` handles the WebSocket/Firebase sync layer.

## 7. Key Architectural Constraints

1. Elements are **data-only** (no methods) — all logic lives in standalone functions.
2. Canvas rendering is **imperative** (not React-managed DOM).
3. The `App` component is a **class component** with imperative canvas control.
4. Keyboard shortcuts are defined **per-action** via `keyTest` predicates.
5. All collections inside elements use **immutable** semantics (readonly arrays).
