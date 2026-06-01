# Add an "export scene" keyboard shortcut

## Why

Exporting the scene is a frequent action, but it currently has no dedicated
keyboard shortcut — users must open a menu. A standard `Ctrl/Cmd + Shift + E`
shortcut speeds up the workflow and matches conventions in other editors.

## What

Introduce a reusable matcher `isExportShortcut(event)` in `@excalidraw/common`
that recognizes `Ctrl/Cmd + Shift + E` in a layout-safe, platform-correct way.
This is the first vertical slice; the export action's `keyTest()` will consume
it to trigger the existing export flow.

## Scope

- **In:** the `isExportShortcut` matcher + unit tests (this slice).
- **Next (out of this slice):** wire `isExportShortcut` into
  `packages/excalidraw/actions/actionExport.tsx` `keyTest()`.
- **Out:** changing the export dialog / formats.

## Non-goals

- No new export format.
- No change to existing shortcuts.
