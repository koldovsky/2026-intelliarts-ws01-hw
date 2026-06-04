## Why

On a busy canvas you often want to act on every element of one kind at once - all arrows, all text, all rectangles - to restyle or delete them together. Today the only bulk-select is "Select all" (Ctrl/Cmd+A), which ignores type. Selecting by type means clicking each element by hand or shift-dragging carefully around neighbours of other types. A "Select similar" command removes that busywork.

## What Changes

- Add a `selectSimilar` action: given the current selection, select every non-deleted, unlocked element whose `type` matches any selected element's type.
- Bind it to the keyboard shortcut Ctrl/Cmd+Shift+A (free today; `selectAll` uses Ctrl/Cmd+A with no Shift).
- Surface it in the command palette through the action's label, and register it in the shortcut map so it shows in the help dialog.
- No breaking changes. The command is additive and a no-op when nothing is selected.

## Capabilities

### New Capabilities

- `selection`: bulk-selection commands for the editor canvas. This change introduces the first requirement under it - selecting elements that share a type with the current selection.

### Modified Capabilities

<!-- none: there is no existing selection spec; selectAll has no spec to amend. -->

## Impact

- `packages/excalidraw/actions/actionSelectSimilar.ts` - new action (mirrors `actionSelectAll.ts`).
- `packages/excalidraw/actions/types.ts` - add `"selectSimilar"` to the `ActionName` union.
- `packages/excalidraw/actions/index.ts` - re-export the action so it registers.
- `packages/excalidraw/actions/shortcuts.ts` - add `selectSimilar` to the `ShortcutName` union and `shortcutMap`.
- `packages/excalidraw/locales/en.json` - add `labels.selectSimilar`.
- `packages/excalidraw/actions/actionSelectSimilar.test.tsx` - new test.
- No new dependencies. No data-format or public-API changes.
