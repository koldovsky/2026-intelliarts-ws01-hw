# Proposal: Duplicate In Place (Ctrl/Cmd+Shift+D)

## Problem

The existing "Duplicate Selection" action (`Ctrl+D`) copies elements with a positional offset (`DEFAULT_GRID_SIZE / 2` in both axes). This offset is useful when you want to visually separate the copy from the original, but it is a friction point when the goal is to stack an exact copy on top of the original — for example, to apply a different style while keeping positional alignment.

## Proposed solution

Add a new action `duplicateInPlace` that duplicates the selected elements at the exact same coordinates as the originals, with no positional offset.

**Keyboard shortcut:** `Ctrl+Shift+D` (Cmd+Shift+D on macOS)

## Scope

- New action file: `packages/excalidraw/actions/actionDuplicateInPlace.ts`
- Export added to: `packages/excalidraw/actions/index.ts`
- Unit test: `packages/excalidraw/actions/actionDuplicateInPlace.test.tsx`
- No UI changes (toolbar or panel component) needed for this slice

## Out of scope

- i18n label (uses a hardcoded label string for this slice; full i18n is follow-up work)
- PanelComponent (toolbar button)