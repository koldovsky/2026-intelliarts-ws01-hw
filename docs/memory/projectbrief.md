# Project Brief — Excalidraw Monorepo

## What

Excalidraw is an open-source whiteboarding and diagramming tool. This monorepo contains the complete source code for the hosted application (excalidraw.com) and the published npm package `@excalidraw/excalidraw`.

## Why

Provide a free, privacy-focused, real-time collaborative drawing tool with a distinctive hand-drawn/sketchy visual style. The React editor component is available as a standalone npm package for third-party integration.

## Who

- **End-users** — whiteboarding, diagramming, collaborative sketching
- **Developers** — embedding `<Excalidraw>` via npm, contributing to the open-source project

## Repository

Educational snapshot for the Intelliarts "Modern AI SDLC: Greenfield vs Brownfield" workshop. Pristine copy with a single initial commit, intentionally stripped of README, dev-docs, and contributing guides.

## Key Features

- Freehand / sketch-style drawing (roughjs)
- Real-time collaboration via socket.io + Firebase
- Image import and embedding
- Export: PNG (with embedded scene data), SVG, JSON
- Keyboard-driven interface with command palette
- Multiple element types: rectangle, ellipse, diamond, line, arrow, freedraw, text, image, frame, embeddable
- Undo/redo with delta-based history
- End-to-end encryption for shareable links and collaboration

## Tech Stack

React 19, TypeScript 5.9, Vite 5, Yarn 1 (Classic), Jotai, roughjs, socket.io-client, Firebase, perfect-freehand, pako

## Monorepo Structure

6 packages + 1 app shell in a Yarn workspaces layout, with a strict dependency DAG: `common → math → element → excalidraw → excalidraw-app`.
