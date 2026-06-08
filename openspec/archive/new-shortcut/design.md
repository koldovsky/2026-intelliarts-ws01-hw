# Design: Keyboard Shortcut for "Unlock All Elements"

## Overview
We will implement the `CtrlOrCmd+Shift+U` shortcut for the `unlockAllElements` action.

## Components
1. **Action Definition**: Modify `packages/excalidraw/actions/actionElementLock.ts` to add `keyTest` to `actionUnlockAllElements`.
2. **Shortcut Mapping**: Update `packages/excalidraw/actions/shortcuts.ts` to include the new shortcut in `shortcutMap` for UI display (if needed).
3. **Common Constants**: Verify `KEYS` in `@excalidraw/common` for 'U' if not already present.

## Implementation Details
- In `actionUnlockAllElements`, add:
  ```typescript
  keyTest: (event) => event[KEYS.CTRL_OR_CMD] && event.shiftKey && event.key.toLocaleLowerCase() === KEYS.U,
  ```
- In `shortcuts.ts`, update `shortcutMap`:
  ```typescript
  unlockAllElements: [getShortcutKey("CtrlOrCmd+Shift+U")],
  ```

## Testing
- Manual test: Create locked elements, then press `CtrlOrCmd+Shift+U`.
- Automated test: Add a test case in `packages/excalidraw/actions/actionElementLock.test.tsx` (or similar).
