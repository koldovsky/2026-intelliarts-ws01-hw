# Technical Context

## Tech Stack
- **Frontend Framework:** React 19
- **Language:** TypeScript 5.9
- **Build Tool:** Vite 5.0
- **State Management:** Jotai (for some app state), React State/Refs
- **Styling:** SCSS, CSS Modules
- **Testing:** Vitest
- **Collaboration:** Socket.io, Firebase (for persistence/metadata)
- **Rendering:** Canvas API, Rough.js (for hand-drawn look)

## Monorepo Structure
The project uses Yarn Workspaces.
- `excalidraw-app/`: The main web application (whiteboard.excalidraw.com).
- `packages/excalidraw/`: The core library package that can be used by other apps.
- `packages/math/`: Shared mathematical utilities.
- `packages/element/`: Element-related logic.
- `packages/common/`: Common shared utilities.
- `packages/fractional-indexing/`: Utilities for fractional indexing (often used for ordering elements).
- `packages/utils/`: General purpose utilities.

## Core Commands
Since `yarn` might not be available in all environments, `npm` can be used as a fallback.

- **Installation:** `yarn install` or `npm install`
- **Development Start:** `yarn start` or `cd excalidraw-app && npx vite`
- **Build:** `yarn build`
- **Testing:** `yarn test`
- **Typechecking:** `yarn test:typecheck`
- **Linting:** `yarn test:code`

## Development Environment
- Node.js >= 18.0.0
- Yarn 1.22+ (recommended) or NPM
- Docker and Docker Compose (optional, for containerized environment)
