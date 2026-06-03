# Excalidraw — Project Brief

## What It Is

Excalidraw is an open-source, browser-based collaborative whiteboard tool for
creating hand-drawn-style diagrams. It renders on an HTML Canvas using the
Rough.js library to produce a distinctive sketchy aesthetic.

## Core Value Proposition

- **Instant sketching** — zero-config, opens in a browser, no sign-up required
- **Hand-drawn look** — every shape looks like it was drawn on paper (Rough.js)
- **Real-time collaboration** — multiple users edit the same board simultaneously
- **Privacy-first** — end-to-end encryption for shared sessions
- **Extensible** — published as an npm package (`@excalidraw/excalidraw`) that
  any React app can embed

## Primary Use Cases

1. Architecture diagrams and system design sketches
2. Wireframes and UI mockups
3. Brainstorming sessions and mind-maps
4. Technical documentation illustrations
5. Embedded drawing widget in third-party products

## Target Users

- Software engineers (architecture, design docs)
- Product/UX designers (low-fidelity wireframes)
- Educators (interactive visual explanations)
- Anyone who needs quick, shareable diagrams

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| HTML Canvas (not SVG DOM) | Performance with thousands of elements |
| Rough.js for rendering | Signature hand-drawn style |
| Monorepo with Yarn workspaces | Shared code between app and npm package |
| React class component (`App`) | Predates hooks; holds complex imperative canvas logic |
| Fractional indexing for z-order | Conflict-free ordering in multiplayer |
| Soft-delete (`isDeleted` flag) | Preserves history for undo/redo & collaboration |

## Repository Purpose (Workshop Context)

This is a **snapshot** of the Excalidraw codebase used as a brownfield exercise.
Original README, dev-docs, and CONTRIBUTING files have been intentionally removed
so participants must explore the code and reconstruct documentation themselves.
