# High-level Architecture

## Overview
Excalidraw is a React-based application designed for high-performance canvas manipulation. It follows a modular architecture where the core logic is decoupled from the web application wrapper.

## Data Flow
1. **User Interaction:** Events (mouse, touch, keyboard) are captured by the canvas or UI components.
2. **Action Dispatch:** Interactions trigger actions that define how the state should change.
3. **State Update:** The `elements` array or `appState` object is updated immutably.
4. **Re-rendering:** React detects the state change and triggers a re-render.
5. **Canvas Draw:** The updated elements are redrawn onto the HTML5 Canvas using Rough.js.

## Rendering Pipeline
- **Input Processing:** Coordinates are normalized and transformed based on zoom and scroll.
- **Shape Generation:** Rough.js generates drawing instructions (paths) for each element.
- **Canvas Painting:** Instructions are executed on the canvas context.
- **Optimization:** Only affected parts of the canvas are redrawn when possible, and static elements can be cached.

## State Management
- **Local State:** Managed via React's `useState`, `useReducer`, and `useRef`.
- **Global State:** Managed via `Jotai` for cross-cutting concerns like theme or UI visibility.
- **Persistence:** Elements and state are saved to `localStorage` or `IndexedDB` to survive page reloads.

## Package Dependencies
- **React:** UI library.
- **Rough.js:** Core drawing engine for the sketchy look.
- **Vite:** Modern build tool for fast development and optimized builds.
- **Socket.io-client:** For real-time collaboration.
- **Vitest:** Testing framework.

## Collaboration Architecture
- **Room System:** Users join rooms identified by a unique ID and a decryption key.
- **Encryption:** All data sent over the network is encrypted using Web Crypto API.
- **Binary Format:** For efficiency, data might be serialized into a binary format before transmission.
