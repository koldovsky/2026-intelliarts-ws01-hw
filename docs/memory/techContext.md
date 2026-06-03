# Tech Context — Excalidraw Monorepo

## Technology Stack

| Layer | Technology |
| --- | --- |
| Language | TypeScript 5.9.3 |
| UI Framework | React 19 |
| Bundler | Vite 5 |
| Package Manager | Yarn 1.22.22 (Classic) with workspaces |
| State Management | Jotai (editor-internal isolated store + app-level shared store) |
| Canvas Rendering | roughjs (hand-drawn style), Canvas 2D API |
| Freehand Strokes | perfect-freehand |
| Image Resizing | pica / image-blob-reduce |
| Compression | pako (deflate) |
| Encryption | Web Crypto API (AES-GCM) |
| Real-time Comm | socket.io-client |
| Backend | Firebase (auth, Firestore, Cloud Storage) |
| Testing | Vitest + jsdom + vitest-canvas-mock |
| Linting | ESLint + Prettier |
| CI | GitHub Actions + CodeRabbit |

## Key Commands

```bash
yarn start                 # Dev server (localhost:3001)
yarn test                  # Run tests (Vitest, watch mode)
yarn test:all              # Full suite: typecheck + lint + tests
yarn test:coverage         # Run tests with coverage
yarn build                 # Production build (excalidraw-app)
yarn build:packages        # Build all shared packages (common → fractional-indexing → math → element → excalidraw)
yarn fix                   # Auto-format + lint fix
yarn typecheck             # tsc (in root)
```

## Package Roles

| Package | Path | Purpose |
| --- | --- | --- |
| `@excalidraw/common` | `packages/common` | Constants, colors, event emitter, utility types |
| `@excalidraw/math` | `packages/math` | Geometric primitives (point, vector, line, segment, curve, ellipse, etc.) |
| `@excalidraw/element` | `packages/element` | Element types, Scene, Store/Snapshot/Delta, rendering, selection, transforms |
| `@excalidraw/excalidraw` | `packages/excalidraw` | React editor component (published npm package) |
| `@excalidraw/fractional-indexing` | `packages/fractional-indexing` | Ordered position strings |
| `@excalidraw/utils` | `packages/utils` | Export helpers (canvas, SVG, clipboard) |
| `excalidraw-app` | `excalidraw-app` | Hosted application shell (Firebase, collab, UI) |

## Dev Environment

- **Node**: >= 18.0.0
- **Port**: 3001 (dev server)
- **No .env required** for development — `.env.development` and `.env.production` are provided
- **Context limiting**: `.cursorignore` in project root (30 patterns)

## Build Output

| Directory             | Contents              |
| --------------------- | --------------------- |
| `excalidraw-app/dist` | Production app bundle |
| `packages/*/dist`     | ESM package builds    |
| `coverage/`           | Test coverage reports |
| `dev-dist/`           | Vite PWA dev output   |

## Testing Conventions

- Tests are co-located in `tests/` directories or alongside source files as `.test.ts`
- Vitest with jsdom environment
- Canvas mocking via `vitest-canvas-mock`
- Snapshots stored in `__snapshots__/` directories
