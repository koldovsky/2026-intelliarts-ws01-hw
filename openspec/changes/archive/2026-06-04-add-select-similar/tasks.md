## 1. Register the action name

- [x] 1.1 Add `"selectSimilar"` to the `ActionName` union in `packages/excalidraw/actions/types.ts` (next to `"selectAll"`)

## 2. Implement the action

- [x] 2.1 Create `packages/excalidraw/actions/actionSelectSimilar.ts`, mirroring `actionSelectAll.ts`: compute the set of selected element types, then select all non-deleted, unlocked, non-container-bound elements whose type is in that set
- [x] 2.2 Run `selectGroupsForSelectedElements` for group consistency and return `captureUpdate: CaptureUpdateAction.IMMEDIATELY`; return early (no-op) when the selection is empty
- [x] 2.3 Add `keyTest` for Ctrl/Cmd+Shift+A using `event[KEYS.CTRL_OR_CMD] && event.shiftKey && event.key.toLowerCase() === KEYS.A`

## 3. Wire it into the editor

- [x] 3.1 Re-export `actionSelectSimilar` from `packages/excalidraw/actions/index.ts` so the module loads and registers
- [x] 3.2 Add `selectSimilar` to the `ShortcutName` union and `shortcutMap` (`CtrlOrCmd+Shift+A`) in `packages/excalidraw/actions/shortcuts.ts`
- [x] 3.3 Add `labels.selectSimilar` to `packages/excalidraw/locales/en.json`

## 4. Test

- [x] 4.1 Create `packages/excalidraw/actions/actionSelectSimilar.test.tsx` covering: single-type selection, mixed-type selection, locked excluded, container-bound text excluded, and no-op on empty selection
- [x] 4.2 Run the test file with Vitest and confirm it passes

## 5. Verify

- [x] 5.1 `yarn test:typecheck` passes for the changed files
- [x] 5.2 `openspec validate add-select-similar --strict` passes
