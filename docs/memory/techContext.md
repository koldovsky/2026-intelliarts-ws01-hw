# Technical Context

## Tech Stack

- **Language**: TypeScript 5.9.3
- **Frontend Framework**: React 19.x
- **Build Tool / Bundler**: Vite 5.0.12
- **Testing**: Vitest 3.0.6
- **Package Manager**: Yarn 1.22.22 with Yarn Workspaces
- **Core Dependencies**: RoughJS 4.6.4, Jotai 2.11.0

## Monorepo Structure

The project uses Yarn Workspaces to split the application into logical boundaries:

- `excalidraw-app/`: The standalone web application.
- `packages/excalidraw/`: The main React component and core logic.
- `packages/element/`: Element definitions and handlers.
- `packages/math/`: Geometry and mathematical utilities.
- `packages/common/`: Shared configuration and types.

## Development Setup

### Installation

Run the following in the root directory to install dependencies and validate workspaces:

```bash
yarn clean-install
# or simply
yarn install
```

### Running Locally

To start the Vite development server for the main app:

```bash
yarn start
```

_(This maps to `yarn --cwd ./excalidraw-app start`)_

### Testing

To run the Vitest suite:

```bash
yarn test
```

### Building

To build the application for production:

```bash
yarn build
```

_(Maps to `yarn --cwd ./excalidraw-app build`)_
