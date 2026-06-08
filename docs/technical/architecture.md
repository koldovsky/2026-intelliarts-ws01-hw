# Technical Architecture

## 1. High-level Architecture

This is a **Yarn monorepo** containing a collaborative infinite-canvas whiteboard application. The codebase is split into independent library packages consumed by a Vite-based web application.

```
Root (yarn workspaces)
├── excalidraw-app/          ← Deployed web application (Vite SPA)
└── packages/
    ├── common/              ← Shared constants, color utils, MIME types
    ├── math/                ← Vector, matrix, geometry primitives
    ├── fractional-indexing/ ← Multiplayer element ordering
    ├── element/             ← Element types, mutations, Scene, Store, binding
    ├── excalidraw/          ← Core React component + all drawing/action logic
    └── utils/               ← File I/O, export helpers, URL safety
```

### Responsibilities by Area

| Area | Responsibility |
|---|---|
| `packages/common` | Cross-package constants, color handling (`tinycolor2`), utility functions shared by all packages |
| `packages/math` | Pure geometric math — vectors, matrices, angle/distance calculations used by rendering and element logic |
| `packages/fractional-indexing` | Generates stable ordering strings for elements in concurrent multi-user sessions |
| `packages/element` | Canonical element type definitions, the `Scene` class, element mutation helpers, the `Store` + undo/redo delta system, binding logic, bounds/collision |
| `packages/excalidraw` | Published `@excalidraw/excalidraw` React component; owns the canvas renderer, action system, `AppState`, all UI components, the `ExcalidrawAPI`, history, and library |
| `excalidraw-app` | Runnable SPA; wires the Excalidraw component to Firebase persistence, Socket.io collaboration, PWA, i18n, error tracking, and app-level UI |

---

## 2. Data Flow

### 2.1 Scene Initialization

```
Browser loads excalidraw-app/index.tsx
  → App.tsx: initializeScene()
      ├── 1. Load from localStorage / IndexedDB (local-first)
      ├── 2. If collab link in URL → loadFromFirebase() (Firestore)
      ├── 3. If share link in URL → fetch from backend API
      └── 4. excalidrawAPI.updateScene({ elements, appState })
               → canvas re-renders
```

`restoreElements()` and `restoreAppState()` normalize and repair any loaded data before passing it to the API. `bumpElementVersions()` is called after restoring from a link to force a fresh version nonce.

### 2.2 User Edit Flow (local)

```
User gesture on canvas (mouse/touch/keyboard)
  → Canvas event handler (InteractiveCanvas.tsx)
  → ActionManager.handleKeyDown() or direct element mutation
  → Action.perform() returns ActionResult { elements, appState, captureUpdate }
  → Store.capture(CaptureUpdateAction.IMMEDIATELY)
      ├── calculates StoreDelta (elements diff + appState diff)
      ├── emits DurableIncrement (→ History, enabling undo/redo)
      └── triggers re-render via updater callback
  → If collab active: Collab.onChange() → Portal.broadcastScene("UPDATE")
```

### 2.3 Collaboration Sync Flow

```
Local change broadcasted:
  Portal.broadcastScene()
    → encrypt payload (AES with roomKey from URL hash)
    → socket.emit(WS_EVENTS.SCENE_UPDATE, encryptedData)

Remote change received:
  socket.on(WS_EVENTS.SCENE_UPDATE)
    → decryptData(roomKey)
    → reconcileElements(localElements, remoteElements)
    → excalidrawAPI.updateScene({ elements, captureUpdate: NEVER })
       (NEVER = does not pollute undo stack)
```

### 2.4 Persistence Flow

```
Drawing auto-saved:
  App.tsx onChange handler
    → LocalData.save(elements, appState)    ← localStorage + IndexedDB
    → if collab room active:
        isSavedToFirebase() check
        → saveFilesToFirebase() for new images
        → Firestore transaction with encrypted elements

Drawing loaded:
  loadFromFirebase() → getDoc(Firestore) → decryptData() → reconcileElements()
```

### 2.5 Binary Files (Images)

Images follow a separate path from elements:

```
User drops/pastes image
  → element created with status: "pending", fileId: FileId
  → FileManager queues upload
  → saveFilesToFirebase() → Firebase Storage (encrypted, content-addressed by FileId)
  → element.status → "saved"
```

---

## 3. State Management

### 3.1 AppState

The primary canvas state is the `AppState` object, defined in `packages/excalidraw/appState.ts`. It is a large flat structure (~300+ fields) owned inside the `Excalidraw` component and managed immutably. Key groups:

| Group | Examples |
|---|---|
| Tool & interaction | `activeTool`, `newElement`, `editingTextElement`, `multiElement` |
| Style defaults | `currentItemStrokeColor`, `currentItemFillStyle`, `currentItemFontSize` |
| Viewport | `zoom`, `scrollX`, `scrollY`, `viewBackgroundColor` |
| Grid | `gridSize`, `gridModeEnabled` |
| Collaboration | `isCollaborating`, `collaborators: Map<SocketId, Collaborator>` |
| Selection | `selectedElementIds`, `selectedGroupIds` |
| UI panels | `openMenu`, `openDialog`, `openSidebar` |

`AppState` is never mutated in place. Actions return a new partial `appState` via `ActionResult`, which is merged by the updater inside the `Excalidraw` component.

### 3.2 Element State

Elements are managed by the `Scene` class (`packages/element/src/Scene.ts`) as an ordered, keyed collection:
- `getElements()` — returns non-deleted elements in render order
- `getElementsMapIncludingDeleted()` — full map for reconciliation
- Elements are immutable value objects — always replaced via `newElementWith()`, never mutated in place

### 3.3 Store & History (`packages/element/src/store.ts`)

```
CaptureUpdateAction enum:
  IMMEDIATELY — creates a durable (undoable) increment immediately
  NEVER       — creates an ephemeral increment (remote sync, scene init)
  EVENTUALLY  — deferred durable capture (multi-step async operations)

Store lifecycle per change:
  Store.capture(action, elements, appState)
    → computes StoreDelta (ElementsDelta + AppStateDelta)
    → emits StoreIncrement:
         DurableIncrement  → History stack (undo/redo)
         EphemeralIncrement → broadcast only, no history entry
```

`HistoryDelta` (`packages/excalidraw/history.ts`) extends `StoreDelta` and explicitly excludes `version` and `versionNonce` fields so undo/redo does not conflict with multiplayer reconciliation.

### 3.4 Jotai Atoms

Fine-grained UI state is managed with **Jotai** atoms (v2.11.0). A custom store (`appJotaiStore`) is created via `createStore()` in `excalidraw-app/app-jotai.ts`.

**Rule:** Never import directly from `jotai`. Use:
- `excalidraw-app/app-jotai.ts` within the app
- `editor-jotai` module within `packages/excalidraw`

This is enforced by ESLint. Key atoms:

| Atom | Location | Purpose |
|---|---|---|
| `isCollaboratingAtom` | `excalidraw-app/collab/Collab.tsx` | Active collab session flag |
| `isOfflineAtom` | `excalidraw-app/collab/Collab.tsx` | Network offline state |
| `appLangCodeAtom` | `excalidraw-app/app-language/` | Active UI locale |
| `localStorageQuotaExceededAtom` | `excalidraw-app/data/LocalData.ts` | Storage warning |
| `isSidebarDockedAtom` | `packages/excalidraw/` | Sidebar docked/floating |
| `isLibraryMenuOpenAtom` | `packages/excalidraw/` | Library panel visibility |
| `activeConfirmDialogAtom` | `packages/excalidraw/` | Active confirm modal |
| `activeEyeDropperAtom` | `packages/excalidraw/` | Eye dropper tool state |

Atoms are colocated with the feature that owns them — there is no central atom registry.

---

## 4. Rendering Pipeline

### 4.1 Canvas Layers

The canvas is split into three composited layers, each a separate `<canvas>` element:

| Layer | Component | Renderer | Purpose |
|---|---|---|---|
| Static | `StaticCanvas.tsx` | `renderer/staticScene.ts` | Finished, non-interactive elements |
| New element | `NewElementCanvas.tsx` | `renderer/renderNewElementScene.ts` | Element being drawn by the user |
| Interactive | `InteractiveCanvas.tsx` | `renderer/interactiveScene.ts` | Selection handles, transform handles, snap guides, collaborator cursors |

`interactiveScene.ts` is the largest renderer (≈58 KB) and handles the majority of overlay rendering.

### 4.2 Static Rendering

`renderer/staticScene.ts` iterates non-deleted, viewport-visible elements and renders each via **RoughJS** (hand-drawn aesthetic). Each element type has a dedicated render function. The RoughJS `seed` field on each element ensures that the shape is rendered identically across clients and page reloads.

### 4.3 SVG Export

`renderer/staticSvgScene.ts` (≈25 KB) mirrors the static canvas renderer but outputs SVG nodes, used for export and clipboard operations.

### 4.4 Render Triggers

Rendering is triggered by:
1. `Store` emitting a `StoreIncrement` (any element or appState change)
2. Direct `excalidrawAPI.updateScene()` calls (from collab sync, scene load)
3. `excalidrawAPI.refresh()` (viewport resize, theme changes)

The `Excalidraw` component subscribes to the store emitter and schedules React re-renders via the updater callback established in `ActionManager`.

### 4.5 Performance Considerations (Verified)

- **Viewport culling:** Only elements within the current viewport are passed to the renderer.
- **Asset inlining disabled:** `assetsInlineLimit: 0` in `vite.config.mts` — assets are always separate files, preventing large inline data URIs in the bundle.
- **Code splitting:** Locales, CodeMirror, and Mermaid libraries are in separate chunks (configured in `vite.config.mts`).
- **Throttled broadcasts:** Cursor/pointer updates and file uploads are throttled via `throttleRAF` and `FILE_UPLOAD_TIMEOUT`.

---

## 5. Package Dependencies

### 5.1 Internal Dependency Graph

```
@excalidraw/common          (no internal deps)
       ↑
@excalidraw/math            (← common)
       ↑
@excalidraw/fractional-indexing  (no internal deps)
       ↑
@excalidraw/element         (← common, math, fractional-indexing)
       ↑
@excalidraw/excalidraw      (← common, element, math)

@excalidraw/utils           (no internal deps — only external)
excalidraw-app              (← @excalidraw/excalidraw, plus Firebase, Socket.io)
```

**Build order must follow this graph:** `common → math + fractional-indexing → element → excalidraw`.  
Script: `yarn build:packages`

### 5.2 Package Roles and Key External Dependencies

**`@excalidraw/common`**
- Own deps: `tinycolor2` (color parsing/manipulation)

**`@excalidraw/math`**
- Own deps: none beyond `common`

**`@excalidraw/element`**
- Own deps: none beyond internal packages
- Owns: `Store`, `Scene`, element types, delta/history infrastructure

**`@excalidraw/excalidraw`**
- `roughjs@4.6.4` — hand-drawn rendering
- `perfect-freehand@1.2.0` — stroke smoothing
- `jotai@2.11.0` + `jotai-scope@0.7.2` — atomic UI state
- `@codemirror/*` (6 packages) — in-canvas code editor
- `radix-ui@1.4.3` — accessible UI primitives
- `@excalidraw/mermaid-to-excalidraw@2.2.2` — Mermaid diagram import
- `pako` — compression for export/import
- `lodash.debounce`, `lodash.throttle` — rate limiting
- `nanoid` — ID generation
- `canvas-roundrect-polyfill` — cross-browser rounded rectangles

**`excalidraw-app`**
- `firebase@11.3.1` — Firestore (scene storage) + Cloud Storage (file storage)
- `socket.io-client@4.7.2` — real-time collaboration WebSocket
- `idb-keyval@6.0.3` — IndexedDB wrapper for local persistence
- `@sentry/browser@9.0.1` — error tracking
- `i18next-browser-languagedetector@6.1.4` — locale detection

### 5.3 Dependency Boundaries to Preserve

- `packages/common`, `packages/math`, `packages/fractional-indexing` must not import from `packages/element` or `packages/excalidraw` (they are the foundation).
- `packages/element` must not import from `packages/excalidraw` (element is a dependency of excalidraw, not the reverse).
- `packages/utils` is intentionally standalone — it does not import from any other internal package.
- `excalidraw-app` is the only layer allowed to import Firebase, Socket.io, and Sentry.

---

## 6. Important Architectural Patterns

### 6.1 Element System

All drawable entities are plain objects extending `_ExcalidrawElementBase` from `packages/element/src/types.ts`. Key invariants:

- **Immutable** — elements are never mutated in place. Use `newElementWith(element, patch)` to produce a modified copy.
- **Soft-deleted** — `isDeleted: true` marks removal; deleted elements remain in the array and are synchronized to peers.
- **Versioned** — every mutation must increment `version` and randomize `versionNonce`. This is how `reconcileElements()` resolves concurrent edits.
- **Fractionally indexed** — the `index: FractionalIndex` field provides a stable z-order across concurrent inserts without requiring reindexing.
- **Type-discriminated** — `element.type` narrows to specific interfaces (`ExcalidrawRectangleElement`, `ExcalidrawTextElement`, etc.).

### 6.2 Action System

Located in `packages/excalidraw/actions/` (49 action files + core).

An **Action** is a typed object:
```typescript
interface Action {
  name: ActionName;          // one of 101 named variants
  label: string | Function;
  perform(elements, appState, formData, app): ActionResult | Promise<ActionResult>;
  keyTest?: (event) => boolean;
  predicate?: (appState, elements) => boolean;
  PanelComponent?: React.FC;  // optional toolbar button
}
```

`ActionResult` returns `{ elements?, appState?, files?, captureUpdate: CaptureUpdateActionType }`. The `captureUpdate` field tells the Store how to handle undo/redo for this result.

`ActionManager` (`packages/excalidraw/actions/manager.tsx`) registers all actions at startup via `registerAll()`, dispatches keyboard events via `handleKeyDown()`, and executes actions via its `updater` callback. External consumers can register custom actions via `excalidrawAPI.registerAction()`.

### 6.3 ExcalidrawAPI (Imperative API)

The `Excalidraw` component exposes a ref-based imperative API (`ExcalidrawImperativeAPI`, defined in `packages/excalidraw/types.ts:943`). Key methods:

| Method | Purpose |
|---|---|
| `updateScene({ elements, appState })` | Full or partial scene update |
| `applyDeltas(deltas)` | Apply store deltas (used by collab) |
| `mutateElement(element, patch)` | Mutate a single element |
| `getSceneElements()` | Get active (non-deleted) elements |
| `getAppState()` | Read current app state |
| `registerAction(action)` | Register custom action |
| `history.clear()` | Clear undo/redo stack |
| `setActiveTool(tool)` | Programmatically switch tool |
| `addFiles(files)` | Inject binary file data |

The API is provided via React Context (`ExcalidrawAPIContext`) and consumed via `useExcalidrawAPI()`. `excalidraw-app/App.tsx` and `Collab.tsx` both hold references to this API.

### 6.4 Scene Class

`packages/element/src/Scene.ts` manages the live element collection:
- Maintains the element array and a keyed `SceneElementsMap` for O(1) lookup.
- Emits change notifications via callbacks registered with `addCallback()`.
- Provides `getNonDeletedElements()` for render use and `getElementsIncludingDeleted()` for sync use.
- Tracks `SelectionHash` for efficient selection change detection.

### 6.5 Collaboration Architecture

**Portal** (`excalidraw-app/collab/Portal.ts`) — thin Socket.io wrapper:
- Owns the connection lifecycle (`connectToCollabRoom`, `disconnectFromSocketServer`)
- All outgoing payloads are AES-encrypted via `encryptData(roomKey, data)` before emission
- The `roomKey` is derived from the URL hash and never transmitted

**Collab** (`excalidraw-app/collab/Collab.tsx`) — orchestrator:
- Class `PureComponent` holding references to both `ExcalidrawAPI` and `Portal`
- On `SCENE_INIT`: full scene replacement after decryption + `reconcileElements()`
- On `SCENE_UPDATE`: delta merge with `reconcileElements()`, passed to `updateScene({ captureUpdate: NEVER })`
- Tracks idle/active via visibility and mouse activity events
- Coordinates `FileManager` for throttled, deduplicated image uploads to Firebase

### 6.6 Dual Persistence

```
Local (always active):
  LocalData class → localStorage (elements, appState, name)
                 → IndexedDB via idb-keyval (large scenes, files)

Cloud (collab sessions only):
  Firebase Firestore → encrypted scene document per roomId
  Firebase Storage  → encrypted binary files, content-addressed by FileId
```

The two layers are independent. Firebase sync only activates when the user joins a collaboration room. Offline use relies entirely on the local layer.

### 6.7 Encryption

All data leaving the client is AES-encrypted:
- **Key:** derived from the URL fragment (`#roomKey=...`); never sent to any server
- **Functions:** `encryptData()` / `decryptData()` from `packages/excalidraw/data/encryption.ts`
- Applied to: Socket.io payloads (via Portal), Firestore documents, Firebase Storage uploads

---

## 7. Notes for Future Contributors and AI Agents

### Files to Review Before Architectural Changes

| What you're changing | Files to review first |
|---|---|
| Element types or fields | `packages/element/src/types.ts`, `packages/excalidraw/types.ts` |
| Undo/redo behavior | `packages/element/src/store.ts`, `packages/excalidraw/history.ts` |
| Collaboration sync | `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.ts` |
| Firebase persistence | `excalidraw-app/data/firebase.ts`, `firebase-project/firestore.rules` |
| Rendering | `packages/excalidraw/renderer/`, `packages/excalidraw/components/canvases/` |
| Action system | `packages/excalidraw/actions/types.ts`, `packages/excalidraw/actions/manager.tsx` |
| App state shape | `packages/excalidraw/appState.ts` |
| Monorepo build | root `package.json` scripts, `packages/*/package.json` |

### Conventions to Preserve

- **Never mutate elements in place.** Always use `newElementWith()` and increment `version` + `versionNonce`.
- **Soft-delete only.** Set `isDeleted: true`; do not splice elements out of the array.
- **Use the correct Jotai module.** Import from `app-jotai` (app code) or `editor-jotai` (package code) — not directly from `jotai`. ESLint will block direct imports.
- **No CJS.** All packages are ESM-only. Do not use `require()` or add CommonJS exports.
- **Pinned versions.** `.npmrc` sets `save-exact=true`. Do not add floating version ranges to `package.json`.
- **Import order** is enforced by ESLint: builtin → external → internal (`@excalidraw/*`) → parent → sibling → index → type.
- **No barrel imports inside `packages/excalidraw/`** — use direct relative paths to prevent circular dependencies.

### Sensitive / Easy-to-Break Areas

- **`reconcileElements()`** — the algorithm that merges concurrent element updates. Incorrect changes here cause data loss or duplication in collab sessions.
- **`version` / `versionNonce`** — must be updated on every mutation. Missing an update causes reconciliation to silently discard changes.
- **`captureUpdate` field in `ActionResult`** — controls whether an action is undoable. Using `NEVER` on a user action prevents undo; using `IMMEDIATELY` on a remote sync action pollutes the local undo stack.
- **Encryption key handling** — the `roomKey` must only ever live in the URL hash and in-memory. Any change that logs, transmits, or persists the key is a security regression.
- **Package build order** — `packages/excalidraw` depends on `packages/element` which depends on `packages/common` and `packages/math`. Building out of order produces stale type definitions.
- **`getSyncableElements()`** — only elements passing this filter are persisted to Firebase. Changing its predicate changes what gets saved and synced.

### Assumptions to Verify Before Changing Code

- Before changing `AppState` fields: check all places that read the field via `getAppState()` — they exist in both `excalidraw-app/` and `packages/excalidraw/`.
- Before changing element type fields: search for the field name across `packages/element/src/` and `packages/excalidraw/renderer/` — rendering code often reads fields directly.
- Before adding a new external dependency to a `packages/*` library: check whether it should go in `devDependencies` (build-time) or `dependencies` (bundled), and whether it should be a `peerDependency` for the published package.
- Before changing the Firebase Firestore schema: update `firebase-project/firestore.rules` and verify the encryption/decryption round-trip in `excalidraw-app/data/firebase.ts`.
