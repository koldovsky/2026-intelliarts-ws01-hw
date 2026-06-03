# Agent Rules — Excalidraw Monorepo

## Package Manager

Always use **Yarn 1** (`yarn`, never `npm`). Cross-workspace commands use
`yarn --cwd ./packages/<name> <script>`.

## Commands the agent MAY run

| Purpose | Command |
|---|---|
| Dev server | `yarn start` |
| Run tests | `yarn test` or `yarn test:app` |
| Full CI check | `yarn test:all` |
| Type-check only | `yarn test:typecheck` |
| Lint only | `yarn test:code` |
| Auto-fix lint + format | `yarn fix` |
| Build packages (for local linking) | `yarn build:packages` |
| Build production app | `yarn build` |

## Commands the agent MUST NOT run

- `yarn rm:node_modules` / `yarn clean-install` — destructive; ask the user first.
- `yarn release` / `yarn release:*` — publishing; never run autonomously.
- Any `git push` or `git push --force` — always ask first.
- Any command that modifies `.env.production` or Firebase credentials.

## Import Conventions

1. **Never import from `jotai` directly.** Use `editor-jotai` or `app-jotai` (the
   app-specific re-exports inside `packages/excalidraw/`).
2. **Inside `packages/excalidraw/`**, never import from the barrel `index.tsx`.
   Use direct relative imports to the specific module.
3. Always use `import type { … }` for type-only imports
   (`@typescript-eslint/consistent-type-imports` is set to `error`).
4. Group imports in this order (ESLint `import/order` enforces it):
   `builtin` → `external` → `@excalidraw/*` → `internal` → `parent` → `sibling` → `index` → `type`
   with a blank line between groups.

## Element Mutations

- **Never mutate element objects directly.** All mutations go through
  `mutateElement()` from `packages/element/src/mutateElement.ts`, which
  increments `version` / `versionNonce` and invalidates `ShapeCache`.
- Elements are **immutable value objects**; treat them as read-only outside of
  `mutateElement`.

## Adding a New Action

Follow the pattern in `packages/excalidraw/actions/`:

1. Create `action<Name>.ts(x)` — define and `register()` the action.
2. The `perform` function **must return** `{ elements?, appState?, commitToHistory? }` — never mutate state directly.
3. Export the action from `packages/excalidraw/actions/index.ts` if it needs to be
   discoverable outside the package.

## Adding a New Element Type

1. Add the new type discriminant to `ExcalidrawElement` union in
   `packages/element/src/types.ts`.
2. Add a renderer branch in `packages/excalidraw/renderer/staticScene.ts`.
3. Add type-guard helpers (`is<Name>Element`) in
   `packages/element/src/typeChecks.ts`.
4. Add `ShapeCache` invalidation if the element has geometry.

## Testing

- Test files live next to the source they cover **or** in
  `packages/excalidraw/tests/`.
- Use `renderApp` + `UI` / `Pointer` helpers from
  `packages/excalidraw/tests/test-utils.ts` for integration tests.
- `jsdom` + `vitest-canvas-mock` are set up globally; no extra imports needed.
- Run `yarn test:update` to regenerate snapshots.

## TypeScript

- `tsc` is the authoritative type checker. ESLint type rules alone are not
  sufficient — always run `yarn test:typecheck` before marking a task complete.
- The root `tsconfig.json` references all workspace packages; individual
  `packages/*/tsconfig.json` extend `packages/tsconfig.base.json`.

## Lint & Format

- Prettier config is `@excalidraw/prettier-config`; it covers CSS, SCSS, JSON,
  Markdown, HTML, YAML.
- ESLint covers `.js`, `.ts`, `.tsx`. Run `yarn fix` to auto-fix before committing.
- `lint-staged` (`.lintstagedrc.js`) runs both on staged files via Husky pre-commit.

## Files the Agent Must Not Read or Modify

- `node_modules/**`
- `dist/**` / `build/**`
- `coverage/**`
- `**/*.min.js`
- `**/*.snap` (snapshots — regenerate with `yarn test:update` instead)
- `yarn.lock` / `package-lock.json`
