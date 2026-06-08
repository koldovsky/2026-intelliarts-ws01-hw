# Project Brief

## What is Excalidraw?

Excalidraw is an open-source virtual whiteboard for sketching hand-drawn-like diagrams directly in the browser. It requires no account or installation — users open the app and start drawing immediately.

## Core Value

- **Hand-drawn aesthetic**: All shapes render with a natural, sketch-like style powered by the Rough.js library.
- **Real-time collaboration**: Multiple users can draw on the same canvas simultaneously via shareable room links.
- **Offline-first / PWA**: Works fully offline; the app installs as a Progressive Web App.
- **End-to-end encrypted sharing**: Shared scenes are encrypted client-side; the server never sees canvas content.
- **Export flexibility**: Scenes export as SVG, PNG, or the native `.excalidraw` JSON format and can be embedded in other tools.

## Primary Users

Developers, designers, and teams who need quick, low-friction diagrams — architecture sketches, flowcharts, wireframes — without the overhead of polished diagramming tools.

## Technology

TypeScript monorepo with three main packages: the `excalidraw` React component library (published to npm), the `excalidraw-app` browser application, and `@excalidraw/utils` shared helpers. State management is handled internally; the component exposes a clean API for embedding.
