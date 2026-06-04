# System patterns

> Memory Bank file. The four recurring patterns that shape this codebase: canvas rendering, the element system, the action system, and `appState`. Copy these patterns when you add a capability slice; don't invent new ones.

## Canvas rendering

The editor draws onto three stacked `<canvas>` elements, not one (`packages/excalidraw/components/canvases/`):

- Static canvas - the committed scene: every element drawn with RoughJS. Created imperatively in `App` (`App.tsx:828`, `this.rc = rough.canvas(this.canvas)` at `App.tsx:829`), rendered by `renderStaticScene` (`packages/excalidraw/renderer/staticScene.ts:229`).
- Interactive canvas - transient UI: selection outlines, transform handles, snap lines, remote cursors. Rendered by `renderInteractiveScene` (`packages/excalidraw/renderer/interactiveScene.ts:1552`).
- New-element canvas - just the single element currently being drawn, rendered by `renderNewElementScene` (`packages/excalidraw/renderer/renderNewElementScene.ts:16`).

Why split them: the static scene only repaints when scene content changes, while the interactive layer repaints continuously during a drag. Keeping them apart avoids redrawing every element on every mouse move.

Per-element drawing goes through `renderElement` (`packages/element/src/renderElement.ts`), which pulls a cached drawable from `ShapeCache` (`packages/element/src/shape.ts:81`). `ShapeCache` is a `WeakMap` keyed by the element instance; mutating an element's geometry clears its cache entry so the shape regenerates. Static repaints are throttled to animation frames via `throttleRAF` (`packages/common/src/utils.ts`).

The render trigger: `App` subscribes to the scene with `this.scene.onUpdate(...)`, and any scene change schedules a throttled repaint (`packages/excalidraw/scene/Renderer.ts`). `Renderer.getRenderableElements()` filters to viewport-visible, non-deleted, non-being-edited elements before drawing.

## Element system

Elements are plain data objects, not classes. Every element shares a base shape (`_ExcalidrawElementBase`, `packages/element/src/types.ts:40`) and the concrete types form a discriminated union on `type` (`ExcalidrawElement`, `types.ts:206`).

Three pieces of bookkeeping appear on every element and drive collaboration, history, and z-order:

- `version` / `versionNonce` - an incrementing counter plus a random tiebreaker, used to reconcile concurrent edits deterministically.
- `updated` - epoch-ms timestamp.
- `index` - a fractional-index string (`FractionalIndex`) that encodes z-order so an element can be reordered without renumbering its neighbours (`packages/fractional-indexing/`).

Lifecycle:

- Create with the factory functions in `packages/element/src/newElement.ts` (`newElement`, `newTextElement`, `newLinearElement`, `newArrowElement`, `newImageElement`, `newFrameElement`). They set sane defaults and `version: 1`.
- Mutate with `mutateElement` (`packages/element/src/mutateElement.ts:37`), which mutates in place and bumps `version` / `versionNonce` / `updated` automatically, and clears the shape cache on geometry changes. Use `newElementWith` when you need an immutable copy instead.
- Store in the `Scene` (`packages/element/src/Scene.ts:108`), which owns the elements array plus `Map` indexes (all elements and non-deleted), regenerates a `sceneNonce` per update, and notifies subscribers.

Relationships are modelled by id references, not nesting: arrows bind to shapes via `startBinding` / `endBinding`, text binds to a container via `containerId`, and the target keeps a `boundElements` back-reference (`binding.ts`, `textElement.ts`). Groups are virtual - membership is just a `groupIds` array on each element; frames are real elements and members carry a `frameId`. Type guards live in `packages/element/src/typeChecks.ts` (`isLinearElement`, `isTextElement`, `isBindableElement`, and so on); prefer them over raw `type ===` checks.

## Action system

Almost every user operation is an Action - a declarative object, not a method. The interface is in `packages/excalidraw/actions/types.ts:163`. Key fields:

- `name` - unique id.
- `perform(elements, appState, formData, app)` - returns an `ActionResult` (`types.ts:25`): an optional new `elements`, optional `appState` patch, optional `files`, and a `captureUpdate` flag controlling undo/redo.
- `keyTest` - decides whether a keyboard event triggers it.
- `PanelComponent` - optional React UI for the action.
- `predicate` - whether the action is currently enabled.

Each action file calls `register({...})` (`actions/register.ts:5`), which pushes it onto a module-level array. `App` hands that array to the `ActionManager` (`actions/manager.tsx`), which routes keyboard events (`handleKeyDown`), renders UI (`renderAction`), and runs programmatic calls (`executeAction`). Every result flows back through `App.syncActionResult` (`App.tsx:2772`), which replaces elements on the scene, merges the `appState` patch with `setState`, and schedules a history capture based on `captureUpdate`.

`captureUpdate` (`CaptureUpdateAction` in `packages/element/src/store.ts`) is the lever for undo/redo: `IMMEDIATELY` records a discrete undo step, `EVENTUALLY` defers until the next immediate capture, `NEVER` skips history (used for remote/ephemeral changes). Adding a new shortcut or toolbar button means writing one action and registering it - that is the slice pattern for Task 3.

## appState

`appState` is the editor's UI and view state, separate from element data. The type is `AppState` (`packages/excalidraw/types.ts:274`); defaults live in `packages/excalidraw/appState.ts`. It holds the view transform (`scrollX`, `scrollY`, `zoom`), the current selection (`selectedElementIds`, `selectedGroupIds`), the active tool, in-progress edit state (`newElement`, `editingTextElement`, `resizingElement`), current style defaults (`currentItemStrokeColor`, ...), theme and UI flags, and the collaborator list.

The hard rule: element data lives in the `Scene`; UI and view state live in `appState` (React `this.state` on `App`). `appState` references elements by id, it does not own them. An action that changes elements returns `elements`; one that changes only UI returns an `appState` patch; many return both. Keeping that line clean is what lets the static canvas, the history deltas, and the collaboration sync each track only what they care about.
