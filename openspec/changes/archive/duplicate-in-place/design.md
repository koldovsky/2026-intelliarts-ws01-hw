# Design: Duplicate In Place

## Key decisions

### Reuse `duplicateElements` from `@excalidraw/element`

The existing `duplicateElements({ type: "in-place", ... })` utility already handles element ID remapping, text container linkage, frame membership, and fractional index synchronisation. The only difference from `actionDuplicateSelection` is that the `overrides` callback omits the x/y shift.

### `Ctrl+Shift+D` shortcut

- Does not conflict with any existing shortcut in `packages/excalidraw/actions/`
- Consistent with the pattern of `Ctrl+D` (plain) vs `Ctrl+Shift+D` (modified variant)
- Uses `event.key === KEYS.D.toUpperCase()` to detect the shift-modified key

### `CaptureUpdateAction.IMMEDIATELY`

The action produces a distinct undoable event, consistent with `actionDuplicateSelection`.

### No toolbar button in this slice

Mirrors the minimal-scope principle: the action is accessible via keyboard. A toolbar panel can be added later without changing the action's core logic.

## Data flow

```text
User presses Ctrl+Shift+D
  → ActionManager dispatches actionDuplicateInPlace
    → duplicateElements({ type: "in-place" })
      → Returns { duplicatedElements, elementsWithDuplicates }
    → syncMovedIndices() to fix fractional indices
    → Returns { elements, appState (with duplicated elements selected) }
      → Store records IMMEDIATELY delta
        → History push
```

## Files changed

| File | Change |
|---|---|
| `packages/excalidraw/actions/actionDuplicateInPlace.ts` | New — action implementation |
| `packages/excalidraw/actions/index.ts` | Add export |
| `packages/excalidraw/actions/actionDuplicateInPlace.test.tsx` | New — unit tests |
