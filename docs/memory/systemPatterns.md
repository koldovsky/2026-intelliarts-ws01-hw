# System Patterns

## Canvas rendering (dual-layer)

Two separate `<canvas>` elements are maintained:

- **staticScene** (`renderer/staticScene.ts`) — all non-interactive elements. Re-rendered only when element data changes. Expensive to draw.
- **interactiveScene** (`renderer/interactiveScene.ts`) — selection handles, in-progress drawing, cursors, snapping indicators. Re-rendered on every pointer move.

SVG export (`renderer/staticSvgScene.ts`) replicates the static scene in SVG for export purposes.

## Element system

All drawable objects are `ExcalidrawElement` (defined in `packages/element/src/types.ts`). Elements are immutable in principle — mutations always go through `mutateElement()` from `packages/element/src/mutateElement.ts`, which bumps `version` and `versionNonce` so collaborators can detect changes.

Element ordering uses fractional indices (`packages/fractional-indexing/`) stored on each element, making insertion order stable without re-indexing the whole array.

The canonical collection lives in `Scene` (`packages/element/src/Scene.ts`) as a `SceneElementsMap` (a `Map<id, element>`).

## Store and delta system

Changes flow through `Store` (`packages/element/src/store.ts`):

1. Code calls `mutateElement()` or updates `appState`
2. `CaptureUpdateAction` enum governs how the change is tracked:
   - `IMMEDIATELY` — added to undo/redo stack right away
   - `EVENTUALLY` — batched into a group (e.g. in-progress resize)
   - `NEVER` — ephemeral, not tracked (cursor movement)
3. Store creates a `StoreDelta` (= `ElementsDelta` + `AppStateDelta`) from the diff
4. `History` wraps `StoreDelta` as `HistoryDelta` and pushes to the undo stack

`HistoryDelta.applyTo()` replays a delta forward or backward, applying changes to elements and `AppState` to drive undo/redo.

## Action system

All user-triggered operations are `Action` objects registered via `register.ts` in `packages/excalidraw/actions/`. An action has:
- `name` — unique string key
- `perform(elements, appState, formData, app)` — returns `{ elements?, appState?, captureUpdate }` 
- Optional `keyTest` for keyboard binding
- Optional `PanelComponent` for toolbar UI

`ActionManager` (`actions/manager.tsx`) dispatches actions and applies their return values back to the editor state.

## appState

`AppState` (typed in `packages/excalidraw/types.ts`) is a large flat object holding all editor UI state that isn't part of the canvas elements: active tool, selected element IDs, zoom, scroll, open dialogs, theme, collaboration state, etc.

`ObservedAppState` is a subset tracked by the Store for delta diffing.

## Collaboration reconciliation

When remote element updates arrive via socket.io, `reconcileElements()` (`packages/excalidraw/data/reconcile.ts`) merges remote and local arrays using `shouldDiscardRemoteElement()` rules (local takes precedence when the element is actively being edited). Rooms are end-to-end encrypted with AES-GCM (`packages/excalidraw/data/encryption.ts`).

## State management (Jotai)

The editor uses Jotai with `jotai-scope` to isolate editor-level atoms (`packages/excalidraw/editor-jotai.ts`) from app-level atoms (`excalidraw-app/app-jotai.ts`). This lets multiple `<Excalidraw>` instances coexist on the same page without shared atom state.

## Math types (branded)

`packages/math/src/types.ts` defines branded number/array types: `GlobalPoint`, `LocalPoint`, `Vector`, `Radians`, `Degrees`, `LineSegment`, `Curve`, etc. Always use these instead of `{ x, y }` plain objects when writing geometry code.