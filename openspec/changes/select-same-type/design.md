# Design: Select Same Type

## Approach

A new action `actionSelectSameType` registered via the existing action system.
No new state fields are required — the action reads the current
`selectedElementIds`, collects the unique `type` values of those elements, then
returns an updated `selectedElementIds` that also includes every other
non-deleted, non-locked element sharing one of those types.

## Key binding

`Alt+T` — not occupied by any existing shortcut.  
`KEYS.T` is not yet defined in `packages/common/src/keys.ts`; it will be added.

## Affected files

| File | Change |
|------|--------|
| `packages/common/src/keys.ts` | Add `T: "t"` to `KEYS` |
| `packages/excalidraw/actions/types.ts` | Add `"selectSameType"` to `ActionName` |
| `packages/excalidraw/actions/shortcuts.ts` | Add `selectSameType` to `ShortcutName` and `shortcutMap` |
| `packages/excalidraw/actions/actionSelectAll.ts` | Add and export `actionSelectSameType` |
| `packages/excalidraw/actions/index.ts` | Re-export `actionSelectSameType` |

## Behaviour summary

1. If no elements are selected → action is a no-op (returns `false`).
2. Collect the set of `type` strings from currently selected non-deleted elements.
3. Find all non-deleted, non-locked elements whose `type` is in that set.
4. Merge them into `selectedElementIds` (existing selection is preserved / expanded).
5. Update `selectedGroupIds` via `selectGroupsForSelectedElements`.
