# Project context (OpenSpec)

Excalidraw — open-source virtual whiteboard (yarn monorepo, React 19 + TS + Vite,
tests via Vitest). See `docs/memory/` for the reverse-engineered Memory Bank and
`docs/technical/architecture.md` for the architecture.

- Source of truth for behavior changes: the `openspec/changes/<id>/` proposals.
- User-facing operations are implemented via the action system
  (`packages/excalidraw/actions/`) and keyboard matchers in `@excalidraw/common`.

## Conventions

- Specs are written before code (SDD).
- One capability per change; archive after merge.
