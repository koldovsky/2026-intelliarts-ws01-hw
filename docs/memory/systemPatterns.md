# System Patterns

## Architecture Patterns

### Component Hierarchy

- The UI is built entirely in React.
- The `App` component (`packages/excalidraw/components/App.tsx`) is the main controller: it owns `scene`, `actionManager`, `renderer`, `history`, and `state`.
- It renders the `<Excalidraw>` component, which wraps two `<canvas>` layers: **static** (shapes) and **interactive** (selection handles, cursors).

---

## Sub-systems and Contracts

### 1. AppState (`packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`)

Plain React state object (`App.state`). `getDefaultAppState()` produces the initial value.

Key field groups:

| Group | Representative fields |
|---|---|
| Tool | `activeTool`, `currentItemStrokeColor`, `currentItemFontSize`, `currentItemArrowType` |
| Selection | `selectedElementIds`, `hoveredElementIds`, `selectedGroupIds`, `editingGroupId` |
| Viewport | `zoom`, `scrollX`, `scrollY`, `width`, `height`, `offsetTop`, `offsetLeft` |
| Editing | `newElement`, `resizingElement`, `multiElement`, `editingTextElement`, `isCropping` |
| Interaction | `isResizing`, `isRotating`, `selectedElementsAreBeingDragged`, `cursorButton` |
| UI panels | `openMenu`, `openPopup`, `openSidebar`, `openDialog`, `toast` |
| Collaboration | `collaborators: Map<SocketId, Collaborator>`, `userToFollow`, `snapLines` |
| Export | `exportBackground`, `exportEmbedScene`, `exportScale` |
| Grid/Snap | `gridSize`, `gridStep`, `gridModeEnabled`, `objectsSnapModeEnabled` |

`AppState` is **read-only inside actions** — mutations produce a new partial object returned from `perform()`.

---

### 2. Scene (`packages/element/src/Scene.ts`)

Manages the ordered, immutable element collection. Backed by:

- `elementsMap: SceneElementsMap` — all elements including deleted
- `nonDeletedElementsMap: NonDeletedSceneElementsMap` — live lookup map (branded type)
- `sceneNonce: number` — bumped on every change; used as cache key

**Query contract:**

```typescript
getElementsIncludingDeleted(): readonly OrderedExcalidrawElement[]
getNonDeletedElements(): readonly Ordered<NonDeletedExcalidrawElement>[]
getNonDeletedElementsMap(): NonDeletedSceneElementsMap
getElement<T>(id): T | null
getNonDeletedElement(id): NonDeleted<ExcalidrawElement> | null
getSelectedElements(opts): NonDeleted<ExcalidrawElement>[]
getContainerElement(element): ExcalidrawElement | null
getFramesIncludingDeleted(): readonly ExcalidrawFrameLikeElement[]
```

**Mutation contract:**

```typescript
replaceAllElements(nextElements: ElementsMapOrArray): void   // full replace
insertElement(element): void
insertElementsAtIndex(elements, index): void
mapElements(iteratee: (el) => el): boolean                  // returns true if changed
triggerUpdate(): void                                        // bumps nonce, fires listeners
```

**Subscriptions:**

```typescript
onUpdate(cb: SceneStateCallback): SceneStateCallbackRemover
destroy(): void
```

Elements are **never mutated in-place**; callers produce new element objects and call `replaceAllElements()` or `mapElements()`.

---

### 3. Action System (`packages/excalidraw/actions/`)

#### Action interface (`actions/types.ts`)

```typescript
interface Action<TData = any> {
  name: ActionName;                   // union of 148+ literal strings
  label: string | ((elements, appState, app) => string);
  keywords?: string[];
  icon?: ReactNode | ((appState, elements) => ReactNode);
  PanelComponent?: React.FC<PanelComponentProps>;

  // Core contract
  perform(
    elements: readonly OrderedExcalidrawElement[],
    appState: Readonly<AppState>,
    formData: TData | undefined,
    app: AppClassProperties,
  ): ActionResult | Promise<ActionResult>;

  // Activation
  keyTest?(event, appState, elements, app): boolean;
  keyPriority?: number;
  predicate?(elements, appState, appProps, app): boolean;
  viewMode?: boolean;        // true = allowed in view-only mode

  checked?(appState): boolean;
  trackEvent: false | { category: string; action?: string };
}
```

`ActionResult` shape:

```typescript
type ActionResult =
  | {
      elements?: readonly ExcalidrawElement[] | null;
      appState?: Partial<AppState> | null;
      files?: BinaryFiles | null;
      captureUpdate: CaptureUpdateActionType;  // controls history capture
      replaceFiles?: boolean;
    }
  | false;  // no-op / action declined
```

#### ActionManager (`actions/manager.tsx`)

```typescript
class ActionManager {
  actions: Record<ActionName, Action>;
  registerAction(action: Action): void;
  registerAll(actions: readonly Action[]): void;
  executeAction<T extends Action>(action: T, source?: ActionSource, value?): void;
  handleKeyDown(event): boolean;
  renderAction(name: ActionName, data?): JSX.Element | null;
  isActionEnabled(action: Action): boolean;
}
```

`source` is one of `"ui" | "keyboard" | "contextMenu" | "api" | "commandPalette"`.

The `updater` callback (injected at construction) applies `ActionResult` back into `App.state` and `Scene`.

---

### 4. Renderer (`packages/excalidraw/renderer/`, `packages/excalidraw/scene/Renderer.ts`)

Two separate canvas pipelines:

| Pipeline | File | Trigger |
|---|---|---|
| **Static** | `renderer/staticScene.ts` | Shape changes, scroll, zoom |
| **Interactive** | `renderer/interactiveScene.ts` | Pointer/selection/cursor changes |

#### `renderStaticScene(config, throttle?)` — `renderer/staticScene.ts`

```typescript
type StaticSceneRenderConfig = {
  canvas: HTMLCanvasElement;
  rc: RoughCanvas;
  elementsMap: RenderableElementsMap;
  allElementsMap: NonDeletedSceneElementsMap;
  visibleElements: readonly NonDeletedExcalidrawElement[];
  scale: number;
  appState: StaticCanvasAppState;
  renderConfig: {
    canvasBackgroundColor: string;
    imageCache: AppClassProperties["imageCache"];
    renderGrid: boolean;
    isExporting: boolean;
    embedsValidationStatus: EmbedsValidationStatus;
    elementsPendingErasure: ElementsPendingErasure;
    pendingFlowchartNodes: PendingExcalidrawElements | null;
    theme: AppState["theme"];
  };
};
```

#### `renderInteractiveScene(config)` — `renderer/interactiveScene.ts`

```typescript
type InteractiveSceneRenderConfig = {
  app: AppClassProperties;
  canvas: HTMLCanvasElement | null;
  elementsMap: RenderableElementsMap;
  visibleElements: readonly NonDeletedExcalidrawElement[];
  selectedElements: readonly NonDeletedExcalidrawElement[];
  allElementsMap: NonDeletedSceneElementsMap;
  scale: number;
  appState: InteractiveCanvasAppState;
  renderConfig: InteractiveCanvasRenderConfig;
  editorInterface: EditorInterface;
  callback: (data: RenderInteractiveSceneCallback) => void;
  deltaTime: number;
};
```

#### `renderElement(...)` — `packages/element/src/renderElement.ts`

Single-element draw primitive called by both pipelines:

```typescript
renderElement(
  element: NonDeletedExcalidrawElement,
  elementsMap: RenderableElementsMap,
  allElementsMap: NonDeletedSceneElementsMap,
  rc: RoughCanvas,
  context: CanvasRenderingContext2D,
  renderConfig: StaticCanvasRenderConfig | InteractiveCanvasRenderConfig,
  appState: StaticCanvasAppState | InteractiveCanvasAppState,
): void
```

#### `Renderer` class — `packages/excalidraw/scene/Renderer.ts`

Sits between `App` and the render functions. Computes visible elements and `RenderableElementsMap` (filtered, cache-keyed by `sceneNonce`) to avoid redundant canvas work.

---

### 5. ExcalidrawElement (`packages/element/src/types.ts`)

Base fields (all `Readonly`):

```text
id, x, y, width, height, angle: Radians
strokeColor, backgroundColor, fillStyle, strokeWidth, strokeStyle, roughness, roundness, opacity
seed, version, versionNonce, index: FractionalIndex | null
isDeleted, groupIds, frameId, boundElements, updated, link, locked
customData?: Record<string, any>
```

Concrete element types: `ExcalidrawGenericElement`, `ExcalidrawTextElement`, `ExcalidrawLinearElement`, `ExcalidrawArrowElement`, `ExcalidrawFreeDrawElement`, `ExcalidrawImageElement`, `ExcalidrawFrameElement`, `ExcalidrawMagicFrameElement`, `ExcalidrawIframeElement`, `ExcalidrawEmbeddableElement`.

---

### 6. ExcalidrawImperativeAPI (`packages/excalidraw/types.ts`)

External embedding contract. Obtained via `ref` on `<Excalidraw>`.

```typescript
interface ExcalidrawImperativeAPI {
  // Scene
  updateScene(sceneData: SceneData): void;
  resetScene(sceneData?): void;
  applyDeltas(deltas): void;
  mutateElement(element, updates, overwrite?): void;
  getSceneElements(): readonly NonDeletedExcalidrawElement[];
  getSceneElementsIncludingDeleted(): readonly ExcalidrawElement[];

  // State
  getAppState(): Readonly<AppState>;
  setActiveTool(tool: ActiveTool): void;
  setToast(toast): void;
  refresh(): void;
  updateFrameRendering(config): void;
  registerAction(action: Action): void;

  // Events (all return UnsubscribeCallback)
  onChange(cb: (elements, appState, files) => void): UnsubscribeCallback;
  onIncrement(cb): UnsubscribeCallback;
  onPointerDown(cb): UnsubscribeCallback;
  onPointerUp(cb): UnsubscribeCallback;
  onScrollChange(cb): UnsubscribeCallback;
  onStateChange(cb): UnsubscribeCallback;
  onEvent(event, cb): UnsubscribeCallback;

  // Other
  history: { clear(): void };
  id: string;
  isDestroyed: boolean;
}
```

---

### Data Flow Summary

```
User input (pointer/keyboard)
        │
        ▼
  App event handlers
  (App.tsx onPointer*, handleKeyDown)
        │
        ├─► ActionManager.executeAction(action)
        │         │
        │         ▼
        │   action.perform(elements, appState, formData, app)
        │         │
        │         ▼
        │   ActionResult { elements?, appState?, captureUpdate }
        │         │
        │         ▼
        │   App.setState() + Scene.replaceAllElements()
        │         │
        │         ▼
        │   History.record() (if captureUpdate !== NEVER)
        │
        ├─► Scene.triggerUpdate() → sceneNonce++
        │
        ▼
  Renderer.getVisibleCanvasElements() + getRenderableElementsMap()
        │
        ├─► renderStaticScene(staticConfig)    ← shapes
        └─► renderInteractiveScene(interConfig) ← selection / UI overlays
```
