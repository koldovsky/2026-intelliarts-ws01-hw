# Active Context

## Current Focus

Task 3 — Capability Slice with OpenSpec (complete).

**Change implemented:** `wrap-in-frame-shortcut`
Added keyboard shortcut `Ctrl+Shift+F` / `Cmd+Shift+F` to trigger the existing "Wrap Selection in Frame" action.

## What Was Done

1. Created OpenSpec artifacts under `openspec/changes/wrap-in-frame-shortcut/`:
   - `proposal.md` — motivation and scope
   - `design.md` — technical decisions (why `CODES.F`, why `Ctrl+Shift+F`)
   - `specs/wrap-in-frame-shortcut/spec.md` — normative requirements and scenarios
   - `tasks.md` — implementation checklist (6 tasks, all complete)

2. Implementation (3 files changed):
   - `packages/common/src/keys.ts` — added `F: "KeyF"` to `CODES`
   - `packages/excalidraw/actions/actionFrame.ts` — added `CODES` import and `keyTest` to `actionWrapSelectionInFrame`
   - `packages/excalidraw/actions/shortcuts.ts` — populated `wrapSelectionInFrame` entry in `shortcutMap`

3. Tests added to `packages/excalidraw/tests/shortcuts.test.tsx` (3 tests, all passing).

## Next Steps

- Archive the change: `npx openspec archive wrap-in-frame-shortcut`
- Commit everything and push to the feature branch
- Open a PR for CodeRabbit review
- Optional: Task 4 (A/B experiment) and Task 5 (BMAD)