# Active Context

## Current focus

Task 3 — Capability slice complete.

Implemented the **Select Same Type** action (`Alt+T`) as a new keyboard shortcut.
Followed the full OpenSpec cycle: proposal → design → tasks → spec → impl → tests.

## What was just done

- `openspec/changes/select-same-type/` — proposal, design, tasks, spec
- `packages/common/src/keys.ts` — `KEYS.T` confirmed present
- `packages/excalidraw/actions/types.ts` — added `"selectSameType"` to `ActionName`
- `packages/excalidraw/actions/shortcuts.ts` — added `selectSameType` to `ShortcutName` and mapped to `Alt+T`
- `packages/excalidraw/actions/actionSelectAll.ts` — implemented `actionSelectSameType`
- `packages/excalidraw/actions/index.ts` — exported `actionSelectSameType`
- `packages/excalidraw/actions/actionSelectSameType.test.tsx` — 5 Vitest tests (no selection, single type, multi-type, deleted excluded, locked excluded)
- All 104 test files pass; `tsc` clean

## Next steps

- Task 4 — A/B experiment (`docs/ab-experiment.md`)
- Task 5 — BMAD Quick Flow (optional)
