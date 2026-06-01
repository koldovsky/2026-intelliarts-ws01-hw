# AGENTS.md — Excalidraw (WS1)

Project rules for AI agents working in this repo. Derived from the Memory Bank
(`docs/memory/`) — Excalidraw-specific, not generic.

## Architecture boundaries (hard)

- Respect the package layering: `common → math → element → excalidraw → excalidraw-app`.
  A lower-level package MUST NOT import a higher-level one (e.g. `common` must
  not import from `element` or `excalidraw`).
- Cross-package imports use the `@excalidraw/*` aliases, never deep relative
  paths across packages.

## How to add user-facing operations

- New shortcut / toolbar option / export → add an **action** in
  `packages/excalidraw/actions/` (`name`, `perform()`, optional `keyTest()` and
  `PanelComponent`) and register it; do not wire ad-hoc handlers in components.
- Keyboard matching goes through `@excalidraw/common` `keys.ts` (`KEYS`,
  `matchKey`) so non-latin layouts keep working. Do not compare `event.key`
  directly for letter keys.

## Conventions

- Do not hardcode colors — use `COLOR_PALETTE` / helpers from `@excalidraw/common`.
- Do not mutate elements in place; use the element helpers that version them.
- Keep pure logic in `common`/`element`/`math` (easy to unit-test); keep React
  in `excalidraw`.

## Tests & checks (run before a PR)

```bash
yarn test:typecheck     # tsc
yarn test               # vitest (colocate *.test.ts next to source)
yarn test:code          # eslint, max-warnings=0
yarn fix                # prettier + eslint --fix
```

- Tests use Vitest **globals** (`describe/it/expect` without imports), jsdom env.

## Guardrails

- Don't add heavyweight dependencies without need.
- Don't touch generated/build output (`dist/`, `build/`, `__snapshots__/`).
- Small, vertical changes (one capability per PR).
