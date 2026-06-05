# Spec: Duplicate In Place

## Capability

**Name:** `duplicateInPlace`  
**Shortcut:** `Ctrl+Shift+D` / `Cmd+Shift+D`  
**Category:** element

## Behaviour

### Pre-conditions

- One or more non-deleted, non-locked elements are selected
- The editor is not in linear-element point-editing mode (`appState.selectedLinearElement?.isEditing` is false)

### Action

1. Duplicate all selected elements (including bound text elements and elements inside selected frames) using `duplicateElements({ type: "in-place" })` with no positional override
2. The duplicated elements appear at exactly the same coordinates as the originals
3. After duplication, the selection shifts to the newly created duplicates
4. The operation is immediately undoable

### Post-conditions

- `appState.selectedElementIds` contains only the IDs of the newly duplicated elements
- The original elements remain at their original positions, unmodified
- The duplicated elements are at the same position as the originals
- `CaptureUpdateAction.IMMEDIATELY` is used so the action is on the undo stack

### Edge cases

| Condition | Expected result |
|---|---|
| Nothing selected | `perform` returns `false` (no-op) |
| Linear element in point-editing mode | `perform` returns `false` (no-op) |
| Elements being dragged | `perform` returns `false` (no-op) |
| Frame selected | Frame and its children are duplicated in place |

## Keyboard binding

```
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