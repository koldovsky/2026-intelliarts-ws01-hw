---
title: 'Duplicate In Place (Ctrl/Cmd+Shift+D)'
type: 'feature'
created: '2026-06-05'
status: 'done'
route: 'one-shot'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/packages/excalidraw/actions/actionDuplicateSelection.tsx'
---

## Intent

**Problem:** The existing `Ctrl+D` duplicate action offsets copies by `DEFAULT_GRID_SIZE / 2` in both axes, making it awkward to produce an exact stacked copy of selected elements for style layering or masking workflows.

**Approach:** Register a new `duplicateInPlace` action bound to `Ctrl+Shift+D` that calls `duplicateElements` with no positional override, selecting the duplicates after creation.

## Boundaries & Constraints

**Always:**
- Use `duplicateElements({ type: "in-place" })` from `@excalidraw/element` — do not reimplement duplication logic
- Add `"duplicateInPlace"` to the `ActionName` union in `packages/excalidraw/actions/types.ts`
- Export from `packages/excalidraw/actions/index.ts`
- Return `CaptureUpdateAction.IMMEDIATELY` so the action is on the undo stack

**Ask First:**
- Whether a toolbar `PanelComponent` button is also wanted (deferred; not in this slice)

**Never:**
- Modify `duplicateElements` in `@excalidraw/element`
- Add i18n keys (use a hardcoded label string for this slice)
- Change the `Ctrl+D` behaviour

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Single element selected | One rectangle selected | Duplicate at identical x/y; duplicate selected | — |
| Multiple elements selected | Two shapes selected | Both duplicated at identical positions; both selected | — |
| Nothing selected | `selectedElementIds = {}` | No-op (`perform` returns `false`) | — |
| Linear element in point-edit mode | `selectedLinearElement.isEditing = true` | No-op | — |
| Elements being dragged | `selectedElementsAreBeingDragged = true` | No-op | — |
| Frame selected | Frame + children in scope | Frame and all children duplicated in place; frame clone selected | — |

## Code Map

- `packages/excalidraw/actions/actionDuplicateInPlace.ts` — new action implementation
- `packages/excalidraw/actions/actionDuplicateSelection.tsx` — reference pattern; provides `duplicateElements` call shape
- `packages/excalidraw/actions/types.ts` — `ActionName` union requires `"duplicateInPlace"` addition
- `packages/excalidraw/actions/index.ts` — export point for all actions
- `packages/excalidraw/actions/actionDuplicateInPlace.test.tsx` — unit tests

## Tasks & Acceptance

**Execution:**
- [x] `packages/excalidraw/actions/actionDuplicateInPlace.ts` -- create action with `keyTest`, `perform`, no `PanelComponent` -- core feature
- [x] `packages/excalidraw/actions/types.ts` -- add `"duplicateInPlace"` to `ActionName` -- TypeScript compliance
- [x] `packages/excalidraw/actions/index.ts` -- add export line -- makes action available to ActionManager
- [x] `packages/excalidraw/actions/actionDuplicateInPlace.test.tsx` -- unit tests for all I/O matrix scenarios

**Acceptance Criteria:**
- Given elements are selected, when the user presses `Ctrl+Shift+D`, then duplicates appear at exactly the same coordinates as the originals
- Given elements are selected, when the action runs, then only the duplicates are selected after completion
- Given nothing is selected, when the user presses `Ctrl+Shift+D`, then no elements are added
- Given `tsc` runs on the project, then no type errors are produced

## Design Notes

`duplicateElements` accepts an `overrides` callback that sets `x` and `y` on each duplicate. Omitting the callback (or returning `{}`) preserves the original coordinates. This is the only difference between `duplicateInPlace` and `duplicateSelection`.

## Verification

**Commands:**
- `yarn test:app packages/excalidraw/actions/actionDuplicateInPlace.test.tsx --watch=false` -- expected: 5 tests pass
- `yarn test:typecheck` -- expected: no errors
