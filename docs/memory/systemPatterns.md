# System Patterns

## Architecture Overview
Excalidraw is built as a highly interactive React application that manages a complex state of drawing elements and renders them using the Canvas API.

## Core Systems

### 1. Element System
- **Elements:** Basic building blocks like rectangles, circles, arrows, and text.
- **State:** Each element has properties like `x`, `y`, `width`, `height`, `angle`, `strokeColor`, `backgroundColor`, etc.
- **Types:** Defined in `packages/excalidraw/element/types.ts`.

### 2. Canvas Rendering Pipeline
- **Rough.js:** Used to generate the hand-drawn "rough" look for geometric shapes.
- **Double Buffering:** Often used to ensure smooth rendering.
- **Layers:** Support for static and active (preview) layers.
- **Re-rendering:** Triggered by changes in `appState` or `elements`.

### 3. State Management (`appState`)
- **App State:** Controls the overall state of the application (zoom, scroll, selected tool, theme, etc.).
- **Jotai:** Used for some global state management.
- **React State:** Used for component-level and some application-level state.
- **Synchronization:** State is synchronized across users in collaborative mode.

### 4. Action System
- **Actions:** Encapsulate operations that modify `elements` or `appState` (e.g., "delete element", "change stroke color").
- **Undo/Redo:** Managed by tracking a history of actions or snapshots of the state.

### 5. Collaboration (Collab)
- **Portal:** Manages real-time connection using Socket.io.
- **Reconciliation:** Handles merging changes from multiple users.
- **Encryption:** End-to-end encryption ensures data privacy.

## Key Design Patterns
- **Functional Components with Hooks:** Modern React patterns.
- **Immutability:** State updates are done immutably to simplify change detection and undo/redo.
- **Component Injection:** The core library allows injecting custom components into the UI.
- **Local-first:** Data is primarily stored in the browser (localStorage, IndexedDB) and synced to the cloud if collaboration or cloud storage is enabled.
