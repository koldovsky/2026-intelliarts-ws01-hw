# Project brief - Excalidraw

> Memory Bank file. Reconstructed from the code during WS1 onboarding, because this snapshot ships without the original `README.md` / `dev-docs/`.

## What this is

Excalidraw is an open-source virtual whiteboard for sketching diagrams in a hand-drawn style. It runs in the browser, draws to HTML `<canvas>`, and supports real-time collaboration. This repository is the monorepo: a set of npm packages under `packages/` plus the hosted web app in `excalidraw-app/`.

## What ships from here

Two products come out of this one repo:

- `@excalidraw/excalidraw` - an embeddable React component that other apps drop into their own UI. Its public surface is `packages/excalidraw/index.tsx` (`packages/excalidraw/index.tsx:308`).
- excalidraw.com - the public web app, which wraps that component and adds collaboration, local persistence, and Excalidraw+ export (`excalidraw-app/App.tsx`).

The split matters: the editor knows nothing about Firebase or rooms. Everything network- and account-related lives in `excalidraw-app/`, layered on top of the package through its props and imperative API.

## Core capabilities

- Drawing primitives: rectangle, diamond, ellipse, line, arrow (straight, curved, elbow), freedraw, text, image, frame, embeddable/iframe (`packages/element/src/types.ts:84-393`).
- Selection, grouping, alignment, z-ordering, resize, rotate.
- Arrow-to-shape binding and text-bound-to-container behaviour (`packages/element/src/binding.ts`, `packages/element/src/textElement.ts`).
- Undo/redo with a delta-based history (`packages/excalidraw/history.ts`).
- Local-first persistence (browser storage / IndexedDB) plus end-to-end-encrypted collaboration rooms (`excalidraw-app/collab/`).
- Export to PNG, SVG, and the `.excalidraw` JSON format (`packages/excalidraw/data/`).

## Who uses it

- End users on excalidraw.com.
- Developers who embed the `@excalidraw/excalidraw` component in their own product.

Both audiences constrain the design. The package has to stay framework-host-agnostic and stateless from the outside; the web app is free to be opinionated.

## Out of scope for this repo

- The collaboration server itself (excalidraw-room) lives in a separate project.
- The Excalidraw+ backend is external; this repo only talks to it.

## Workshop framing

Working inside this existing codebase is the brownfield exercise. Adding one small new capability (a shape, a shortcut, a toolbar option, an export format) is a greenfield-style slice carved inside that brownfield. See [architecture](../technical/architecture.md) for the full map and [systemPatterns](./systemPatterns.md) for the recurring patterns to copy when adding that slice.
