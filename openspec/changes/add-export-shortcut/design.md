# Design — export keyboard shortcut

## Key decisions

- **Where:** put the matcher in `@excalidraw/common` `keys.ts`, next to the
  existing matchers (`matchKey`, `isArrowKey`, `shouldRotateWithDiscreteAngle`).
  Keeping it in `common` makes it pure and unit-testable without the editor.
- **Layout safety:** use `matchKey(event, KEYS.E)` rather than comparing
  `event.key === "e"`, so non-latin layouts still match (same approach the repo
  already uses for undo/redo).
- **Platform modifier:** use `KEYS.CTRL_OR_CMD` (resolves to `metaKey` on macOS,
  `ctrlKey` elsewhere) — consistent with other shortcuts.

## Signature

```ts
isExportShortcut(event: KeyboardEvent | React.KeyboardEvent<Element>): boolean
```

Returns `true` only when the platform modifier **and** Shift are held **and**
the key matches `E`.

## Alternatives considered

- Comparing `event.key` directly — rejected (breaks on non-latin layouts).
- Implementing inside `actionExport.tsx` — rejected (not reusable, harder to test).

## Test plan

Colocated `keys.test.ts`: positive case + one negative case per condition
(missing Shift, missing Ctrl/Cmd, different key).
