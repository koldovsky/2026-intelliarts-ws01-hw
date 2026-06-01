# Project Brief — Excalidraw

## What it is

Excalidraw is an open-source virtual **whiteboard for sketching hand-drawn-like
diagrams**. It renders shapes (rectangles, ellipses, arrows, lines, freedraw,
text, images, frames) on an HTML canvas and supports real-time collaboration.

## Purpose

- Quick, low-friction diagramming with a deliberately hand-drawn aesthetic.
- Embeddable editor: the core is shipped as the `@excalidraw/excalidraw` npm
  package; `excalidraw-app` is the hosted reference application (excalidraw.com).

## Audience

- End users: anyone sketching diagrams, wireframes, flowcharts.
- Developers: integrators who embed the `<Excalidraw />` React component.

## Shape of the codebase

- A **yarn monorepo** (`excalidraw-app` + `packages/*`).
- The editor logic lives in packages; the app is a thin shell + collaboration.

## Out of scope (non-goals)

- Not a precise CAD tool; the visual style is intentionally sketchy.
- Core editor has no required backend; collaboration/persistence are app-level.

> Reverse-engineered from the source during WS1 onboarding (no README in repo).
