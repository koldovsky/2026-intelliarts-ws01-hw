# Proposal: Add Keyboard Shortcut for Toggle Midpoint Snapping

## Summary

Add `Alt+M` as a keyboard shortcut for toggling midpoint snapping in the Excalidraw editor.

## Problem

The midpoint snapping feature (`isMidpointSnappingEnabled`) allows arrows and lines to snap to the midpoints of element edges in addition to corners. It is a commonly toggled preference when drawing diagrams with many connectors. Currently, the feature can only be toggled from a context menu or toolbar button — there is no keyboard shortcut. This breaks keyboard-focused workflows where users need to rapidly switch snapping behavior without reaching for the mouse.

## Proposed Solution

Add a `keyTest` predicate to the existing `actionToggleMidpointSnapping` action so that pressing `Alt+M` triggers it. Register `M` in the shared `CODES` constant object. Add the shortcut to the Help Dialog so it is discoverable.

## Non-Goals

- Not changing the underlying snapping behavior or its business logic.
- Not adding any new action, new element type, or new AppState field.
- Not changing the UI representation of the toggle (toolbar button, context menu).

## Scope

Three files, approximately 10 lines of code:

1. `packages/common/src/keys.ts` — add `M: "KeyM"` to the `CODES` object.
2. `packages/excalidraw/actions/actionToggleMidpointSnapping.tsx` — add `keyTest` predicate.
3. `packages/excalidraw/components/HelpDialog.tsx` — add shortcut display entry.

One test file (new or existing) to verify the keyboard shortcut triggers the toggle.

## Why `Alt+M`

- `Alt+S` is already the shortcut for "Toggle Objects Snap Mode" — `Alt+M` follows the same modifier pattern and associates `M` with "Midpoints".
- `Alt+M` is not used by any existing `keyTest` or hardcoded handler in App.tsx.
- Uses the same `Alt` modifier family as other view/snap toggles (`Alt+Z` zen mode, `Alt+R` view mode, `Alt+S` snap mode).

## Effort Estimate

60–90 minutes including test.
