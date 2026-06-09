# Proposal: Select Same Type (Alt+T)

## What

Add a keyboard shortcut `Alt+T` that, when one or more elements are selected,
extends the selection to all non-deleted, non-locked elements of the same
type(s) on the canvas.

## Why

Excalidraw has no way to bulk-select by element type. Users who want to, for
example, change the stroke colour of every rectangle must manually click each
one. This shortcut ("Select Same Type") matches a workflow familiar from
Illustrator (Edit → Select Same → Object Type) and closes a usability gap in
the selection model.

## Out of scope

- No toolbar button or context-menu entry (keyboard only for now).
- No filtering by sub-type (e.g. `elbowArrow` vs `arrow` are treated as
  distinct types matching Excalidraw's own type field).
