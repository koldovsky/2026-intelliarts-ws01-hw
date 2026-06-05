# Spec: Duplicate In Place

## Capability

**Name:** `duplicateInPlace`  
**Shortcut:** `Ctrl+Shift+D` / `Cmd+Shift+D`  
**Category:** element

## ADDED Requirements

- **REQ-DIP-01:** `duplicateInPlace` SHALL only execute when one or more non-deleted, non-locked elements are selected; if `selectedElementIds` is empty the action SHALL return `false` without modifying state.
- **REQ-DIP-02:** `duplicateInPlace` SHALL return `false` when `appState.selectedLinearElement?.isEditing` is `true`.
- **REQ-DIP-03:** `duplicateInPlace` SHALL return `false` when `appState.selectedElementsAreBeingDragged` is `true`.
- **REQ-DIP-04:** `duplicateInPlace` SHALL call `duplicateElements({ type: "in-place" })` with no positional override, so each duplicate's `x` and `y` equal those of its original.
- **REQ-DIP-05:** `duplicateInPlace` SHALL include bound text elements and elements inside selected frames in the duplication set (via `includeBoundTextElement: true, includeElementsInFrames: true`).
- **REQ-DIP-06:** After duplication, `appState.selectedElementIds` SHALL contain only the IDs of the newly created duplicates; original elements SHALL remain unselected and at their original positions.
- **REQ-DIP-07:** `duplicateInPlace` SHALL use `CaptureUpdateAction.IMMEDIATELY` so the operation is a discrete, immediately undoable entry on the history stack.
- **REQ-DIP-08:** When a frame is selected, `duplicateInPlace` SHALL duplicate the frame and all its children in place, preserving `frameId` references on child duplicates.

## Keyboard binding

```ts
keyTest: (event) =>
  event[KEYS.CTRL_OR_CMD] &&
  event.shiftKey &&
  event.key === KEYS.D.toUpperCase()
```

Uses `event.key === "D"` (uppercase because Shift is held). Does not conflict with any existing binding.

## Files

- Implementation: `packages/excalidraw/actions/actionDuplicateInPlace.ts`
- Test: `packages/excalidraw/actions/actionDuplicateInPlace.test.tsx`
- Export: `packages/excalidraw/actions/index.ts`
