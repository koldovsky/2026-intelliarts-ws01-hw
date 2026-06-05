# Project Brief

## What is this?

Excalidraw is an open-source, browser-based virtual whiteboard for sketching hand-drawn-style diagrams. It is a TypeScript + React monorepo. The codebase hosted here is a snapshot used as a brownfield exercise for the Intelliarts WS1 workshop.

## Core value proposition

- Infinite canvas with a hand-drawn aesthetic (roughjs rendering)
- Real-time collaborative editing (socket.io + Firebase, end-to-end encrypted rooms)
- Embeddable as an npm package (`@excalidraw/excalidraw`)
- Progressive Web App deployed at excalidraw.com

## Primary audiences

1. End users of the hosted app (excalidraw.com)
2. Developers embedding the `@excalidraw/excalidraw` package in their own products

## Scope of this snapshot

This is a full monorepo snapshot with the excalidraw-app (the deployed web application) and all library packages intact. Documentation files (README, CONTRIBUTING, dev-docs) were intentionally removed as part of the workshop exercise.