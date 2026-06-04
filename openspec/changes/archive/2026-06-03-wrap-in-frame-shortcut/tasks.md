## 1. Shared Constants

- [x] 1.1 Add `F: "KeyF"` to the `CODES` object in `packages/common/src/keys.ts`

## 2. Action Wiring

- [x] 2.1 Import `CODES` in `packages/excalidraw/actions/actionFrame.ts` (it already imports `KEYS`)
- [x] 2.2 Add `keyTest` to `actionWrapSelectionInFrame` that matches `Ctrl+Shift+F` / `Cmd+Shift+F`

## 3. Shortcut Registration

- [x] 3.1 Update `shortcutMap.wrapSelectionInFrame` in `packages/excalidraw/actions/shortcuts.ts` to include `getShortcutKey("CtrlOrCmd+Shift+F")`

## 4. Tests

- [x] 4.1 Add a unit test in `packages/excalidraw/actions/` (or nearest test file for actionFrame) verifying the `keyTest` matches the expected key combination
- [x] 4.2 Add a test verifying `getShortcutFromShortcutName("wrapSelectionInFrame")` returns a non-empty string