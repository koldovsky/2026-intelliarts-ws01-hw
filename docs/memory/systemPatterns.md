# System Patterns

## Application Entry Point & Component Tree

```
excalidraw-app/index.tsx          ← React 19 root, registers service worker
  └── <ExcalidrawApp />           ← App.tsx (~40KB)
        ├── <ExcalidrawAPIProvider>
        │     └── <Excalidraw />  ← @excalidraw/excalidraw core canvas
        │           ├── MainMenu, WelcomeScreen, Footer (via render props / slots)
        │           └── Canvas, overlays, dialogs (internal to the package)
        ├── <Collab />            ← Socket.io orchestrator (class PureComponent)
        │     └── Portal          ← Socket.io event sender/receiver
        └── Dialog portals (ErrorDialog, ShareableLinkDialog, OverwriteConfirmDialog, etc.)
```

`App.tsx` mounts the core `Excalidraw` component, injects app-specific UI via Excalidraw's slot/render-prop API, and wires in collaboration, Firebase persistence, and app-level Jotai atoms.

---

## State Management

### Jotai Atoms

The project uses **Jotai** (atomic state) as its primary state system — no Redux, no Context-based global store for application state.

**Two atom namespaces:**
- `excalidraw-app/app-jotai.ts` — app-level atoms; all app code must import from here (ESLint enforced, no direct `jotai` imports)
- `packages/excalidraw/` uses its own internal `editor-jotai` module (same rule applies)

**Key atom locations:**

| Atom | Location | Purpose |
|---|---|---|
| `isCollaboratingAtom` | `collab/Collab.tsx` | Whether collab session is active |
| `isOfflineAtom` | `collab/Collab.tsx` | Network offline status |
| `appLangCodeAtom` | `app-language/language-state.ts` | Current UI language |
| `localStorageQuotaExceededAtom` | `data/LocalData.ts` | Storage quota warning |
| `isSidebarDockedAtom` | `packages/excalidraw/` | Sidebar docked state |
| `activeConfirmDialogAtom` | `packages/excalidraw/` | Active confirmation modal |
| `isLibraryMenuOpenAtom` | `packages/excalidraw/` | Library panel open state |
| `activeEyeDropperAtom` | `packages/excalidraw/` | Eye dropper tool state |

**Pattern:** Atoms are colocated with the feature that owns them, not centralized.

### AppState

The Excalidraw canvas state is typed as `AppState` (defined in `packages/excalidraw/appState.ts`). It is a large flat object (~300+ fields) covering:
- Active tool, zoom, scroll position
- Current item style (stroke color, fill, roughness, font, etc.)
- Collaborators map: `Map<SocketId, Collaborator>`
- Selection, editing, multi-element drawing state
- Feature flags and UI panel open/closed states

`AppState` is owned and mutated inside the `Excalidraw` component; external code interacts with it via the `ExcalidrawAPI`.

---

## Element System & Domain Models

### ExcalidrawElement Base Fields

All elements share a base type (`_ExcalidrawElementBase`) with:
- `id`, `x`, `y`, `width`, `height`, `angle` — identity and geometry
- `strokeColor`, `backgroundColor`, `fillStyle`, `strokeWidth`, `strokeStyle`, `roughness`, `opacity` — style
- `seed` — RoughJS shape seed (deterministic rendering across clients)
- `version`, `versionNonce` — conflict detection and reconciliation
- `index` (FractionalIndex) — multiplayer ordering
- `isDeleted`, `updated` — soft-delete and timestamp
- `groupIds`, `frameId`, `boundElements` — hierarchy and relationships
- `locked`, `link`, `customData` — UX and extensibility

### Per-Type Extensions

| Type | Key extra fields |
|---|---|
| `text` | `text`, `fontSize`, `fontFamily`, `textAlign`, `verticalAlign` |
| `arrow` / `line` | `points`, `startArrowhead`, `endArrowhead`, `startBinding`, `endBinding` |
| `image` | `fileId: FileId`, `status: "pending" \| "saved"` |
| `frame` / `magicFrame` | `name` |
| `embeddable` | `embedId` |

Element types are defined in `packages/element/src/types.ts`. Mutations go through `newElementWith()` (returns new object — elements are treated as immutable).

---

## Collaboration Architecture

### Two-Layer Sync

```
User edits canvas
  ↓ ExcalidrawAPI.updateScene()
  ↓ Collab.onChange()
  ↓ Portal.broadcastScene("UPDATE")  ← encrypts with roomKey, emits via Socket.io
  ↓ WebSocket server (external)
  ↓ Portal receives SCENE_UPDATE event
  ↓ decryptData() → reconcileElements()
  ↓ ExcalidrawAPI.updateScene() on remote clients
```

**Firebase** stores the persistent snapshot (Firestore) and binary files (Storage). Socket.io delivers real-time deltas.

### Portal (`excalidraw-app/collab/Portal.ts`)
- Class wrapping Socket.io client
- Manages `roomId` + `roomKey` (key derived from URL hash)
- All payloads encrypted via `encryptData()` before emit
- Broadcasts: `SCENE_UPDATE` (elements), `MOUSE_LOCATION` (cursors), `USER_FOLLOW`, `IDLE_STATUS`

### Collab (`excalidraw-app/collab/Collab.tsx`)
- Class `PureComponent` with access to `ExcalidrawAPI`
- Handles `SCENE_INIT` (full sync on join) and `SCENE_UPDATE` (delta sync)
- Reconciles incoming elements with `reconcileElements()` (version-based, fractional-index-ordered)
- Tracks idle/active transitions, broadcasts user state changes
- Coordinates image uploads via `FileManager` (throttled, deduped)

### Encryption
- Room key is in the URL hash — never sent to any server
- `encryptData()` / `decryptData()` in `packages/excalidraw/data/encryption.ts`
- Firebase documents store elements as AES-encrypted `Bytes` in Firestore

---

## Data Persistence

### Dual-Layer Storage

| Layer | Technology | When Used |
|---|---|---|
| Local (primary) | localStorage + IndexedDB (`idb-keyval`) | Always — offline-first |
| Cloud | Firebase Firestore + Storage | During active collab sessions |

### Firebase Integration (`excalidraw-app/data/firebase.ts`)
- Firestore: stores encrypted scene elements as a document per room
- Storage: stores encrypted binary files (images) per room
- `loadFromFirebase()` — fetches and decrypts scene on room join
- `saveFilesToFirebase()` — uploads new images
- `isSavedToFirebase()` — dirty-check before navigating away
- `FirebaseSceneVersionCache` — `WeakMap<Socket, number>` tracks last-synced version

---

## UI / Component Organization

### `excalidraw-app/components/`

App-level UI injected into the Excalidraw canvas via its slot API:
- `AppMainMenu.tsx` — hamburger menu items
- `AppWelcomeScreen.tsx` — empty-state screen
- `AppFooter.tsx` — bottom toolbar extras
- `AppSidebar.tsx` — right sidebar panel
- `AI.tsx` — AI/magic frame panel
- `LanguageList.tsx` — language switcher

### `packages/excalidraw/components/` (156+ files)

All canvas-internal UI: toolbars, dialogs, panels, overlays, color pickers, library, search, etc.

Components are colocated with their feature logic. There is no global component registry.

---

## Rendering Pipeline

1. **Canvas render** — `packages/excalidraw/` renders all non-deleted, viewport-visible elements onto an HTML5 Canvas using RoughJS (hand-drawn style).
2. **Cursor overlays** — collaborator cursors and selection highlights rendered as SVG overlays on top of the canvas.
3. **Undo/Redo** — handled via `StoreAction` system; changes are tracked in `packages/excalidraw/store.ts`.
4. **Element ordering** — `FractionalIndex` on each element determines z-order; avoids conflicts under concurrent inserts.

---

## Actions / Events

The Excalidraw core uses a typed **action system** (`packages/excalidraw/actions/`):
- Actions are registered objects with `name`, `perform()`, `PanelComponent` (optional toolbar UI), and key bindings.
- `ActionManager` dispatches actions and updates `AppState` + elements.
- Common actions: `actionDeleteSelected`, `actionGroup`, `actionUngroup`, `actionCopy`, `actionPaste`, `actionZoomIn`, `actionZoomOut`, etc.
- External code triggers actions via `ExcalidrawAPI.actionManager.executeAction()`.

---

## Important Conventions

- **Immutable elements** — always use `newElementWith()` for mutations; never mutate element objects in place.
- **`getSyncableElements()`** — only elements passing this filter are sent to Firebase / Socket.io (excludes deleted and invisibly-small).
- **`isDeleted: true`** — elements are soft-deleted and included in sync; hard removal is not used.
- **Jotai import rule** — import from `app-jotai` (app) or `editor-jotai` (package), never directly from `jotai`.
- **ESM only** — no `require()`, no CommonJS exports.
- **No barrel imports** inside `packages/excalidraw/` — use direct relative paths to avoid circular dependencies.
- **Version bumping** — every element mutation must increment `version` and set a new `versionNonce` for reconciliation to work.
- **Import order** — enforced by ESLint: builtin → external → internal → parent → sibling → index → type imports.
