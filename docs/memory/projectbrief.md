# Project Brief

## What Is This Project

A brownfield snapshot of the open-source [Excalidraw](https://github.com/excalidraw/excalidraw) collaborative whiteboard application, used as a homework repository for the **Intelliarts WS1: Modern AI SDLC** workshop.

The upstream project (`README.md`, `CONTRIBUTING.md`, `dev-docs/` intentionally removed) is a browser-based infinite canvas drawing tool with real-time multi-user collaboration.

---

## Main Purpose

Provide an infinite-canvas whiteboard where users can:
- Draw shapes, arrows, text, freehand strokes, and frames
- Embed images and external content
- Collaborate in real time with other users in a shared room
- Export drawings as PNG, SVG, or Excalidraw JSON files
- Work offline and sync changes when back online

---

## Main User-Facing Capabilities

- **Drawing tools** — rectangle, ellipse, diamond, line, arrow, text, image, frame, freehand
- **Styling** — stroke color/width/style, fill color/style, opacity, roughness, roundness
- **Selection & grouping** — multi-select, groups, frames, locking elements
- **Real-time collaboration** — shared room via URL, live cursors, user follow mode, idle detection
- **Persistence** — auto-save to localStorage/IndexedDB; cloud sync via Firebase when in a collab room
- **Import/Export** — Excalidraw JSON, PNG, SVG, clipboard, library items
- **Library** — reusable element library, shareable via URL token
- **AI features** — text-to-diagram (Mermaid) and "magic frame" (AI-generated drawings)
- **PWA** — installable, works offline with service worker

---

## Main Areas / Modules

| Module | Location | Role |
|---|---|---|
| Web Application | `excalidraw-app/` | Runnable SPA (Vite) |
| Core drawing library | `packages/excalidraw/` | Published `@excalidraw/excalidraw` React component |
| Element system | `packages/element/` | Shape types, geometry, binding, mutations |
| Math utilities | `packages/math/` | Vector/matrix/geometry operations |
| Shared constants & utils | `packages/common/` | Cross-package constants, color utilities |
| Fractional indexing | `packages/fractional-indexing/` | Multiplayer element ordering |
| Export/file utilities | `packages/utils/` | File I/O, image export, URL safety |
| Collaboration | `excalidraw-app/collab/` | Socket.io sync, room management |
| Data / persistence | `excalidraw-app/data/` | Firebase, localStorage, IndexedDB |
| Firebase backend | `firebase-project/` | Firestore & Storage rules, indexes |

---

## Important Product Assumptions (Verified from Codebase)

- **No user authentication** — Firebase is used anonymously; identity in collab rooms is a locally-stored display name only.
- **E2E encryption** — all data sent to Firebase and via Socket.io is AES-encrypted with a per-room key embedded in the URL hash (never sent to the server).
- **Offline-first** — drawings are saved to IndexedDB and localStorage; Firebase sync is only active during collab sessions.
- **WebSocket server is external** — collab server URL is configured via `VITE_APP_WS_SERVER_URL`; production uses `https://oss-collab.excalidraw.com`.
- **No CJS output** — all packages publish ESM only.
- **React 19** — project uses React 19 (not 17 or 18).
