## Why

The "Wrap Selection in Frame" action lets users quickly group selected elements inside a new frame, but it is only accessible through the context menu — there is no keyboard shortcut. Power users who rely on keyboard-driven workflows have no fast path to this common framing operation.

## What Changes

- Add `CODES.F` entry to the `CODES` object in `packages/common/src/keys.ts`
- Add a `keyTest` to `actionWrapSelectionInFrame` in `packages/excalidraw/actions/actionFrame.ts` binding `Ctrl+Shift+F` (Windows/Linux) / `Cmd+Shift+F` (Mac)
- Register the new shortcut string in the `shortcutMap` in `packages/excalidraw/actions/shortcuts.ts`

## Capabilities

### New Capabilities

- `wrap-in-frame-shortcut`: Keyboard shortcut (`Ctrl+Shift+F` / `Cmd+Shift+F`) that triggers the existing "Wrap Selection in Frame" action when one or more non-frame elements are selected

### Modified Capabilities

<!-- none — no existing spec-level requirements change -->

## Impact

- **`packages/common/src/keys.ts`**: new `CODES.F` constant
- **`packages/excalidraw/actions/actionFrame.ts`**: `keyTest` added to `actionWrapSelectionInFrame`
- **`packages/excalidraw/actions/shortcuts.ts`**: `wrapSelectionInFrame` entry populated with the new shortcut string
- No API surface, no breaking changes, no new dependencies
