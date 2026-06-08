# Story 1.1: Unlock All Elements Keyboard Shortcut (Ctrl+Shift+U)

Status: ready-for-dev

## Story

As a keyboard-first Excalidraw user,
I want to press Ctrl+Shift+U to unlock all locked elements,
so that I can unlock elements without breaking my keyboard-driven workflow to reach for the mouse.

## Acceptance Criteria

1. Pressing Ctrl+Shift+U when ≥1 element is locked and no elements are selected unlocks all locked elements and selects them.
2. Pressing Ctrl+Shift+U when no elements are locked does nothing (action predicate short-circuits silently).
3. Pressing Ctrl+Shift+U when any elements are currently selected does nothing (predicate blocks: selection must be empty).
4. Ctrl+Shift+U does not conflict with any existing shortcut in the application.
5. The Help Dialog displays "Unlock all" with the Ctrl+Shift+U shortcut key hint, adjacent to the Toggle Element Lock entry.
6. The shortcut is registered in the shortcuts registry (`shortcutMap`) so any tooltip consuming `getShortcutFromShortcutName` can display it.

## Tasks / Subtasks

- [ ] Task 1: Add `KEYS.U` to shared key constants (AC: #1, #2, #3)
  - [ ] In `packages/common/src/keys.ts`, insert `U: "u"` alphabetically between `T: "t"` and `V: "v"` in the `KEYS` object (around line 69)
  - [ ] Verify `KEYS.U` is exported correctly (it is, via the existing `as const` export — no extra work needed)

- [ ] Task 2: Add `keyTest` to `actionUnlockAllElements` (AC: #1, #2, #3)
  - [ ] In `packages/excalidraw/actions/actionElementLock.ts`, append a `keyTest` property to `actionUnlockAllElements` (after `label` on line 213, before the closing `});`)
  - [ ] Pattern to follow: match `actionToggleElementLock`'s `keyTest` style (lines 143–153 in same file)
  - [ ] Implementation: `event.key.toLocaleLowerCase() === KEYS.U && event[KEYS.CTRL_OR_CMD] && event.shiftKey`
  - [ ] Do NOT add predicate logic inside `keyTest` — the existing `predicate` (lines 161–167) already guards `perform` before execution

- [ ] Task 3: Register shortcut in shortcuts registry (AC: #4, #6)
  - [ ] In `packages/excalidraw/actions/shortcuts.ts`, add `"unlockAllElements"` to the `ShortcutName` union inside `SubtypeOf<ActionName, ...>`, after `"toggleElementLock"` (around line 40)
  - [ ] Add `unlockAllElements: [getShortcutKey("CtrlOrCmd+Shift+U")]` to `shortcutMap`, adjacent to `toggleElementLock` entry (around line 106)

- [ ] Task 4: Add Help Dialog entry (AC: #5)
  - [ ] In `packages/excalidraw/components/HelpDialog.tsx`, insert a `<Shortcut>` block immediately after the `toggleElementLock` shortcut entry (after line 461)
  - [ ] Use i18n key `"labels.elementLock.unlockAll"` — already present in all locales including `en.json:163` ("Unlock all")
  - [ ] Pattern: `<Shortcut label={t("labels.elementLock.unlockAll")} shortcuts={[getShortcutKey("CtrlOrCmd+Shift+U")]} />`

## Testing Tasks

- [ ] Test 1: Keyboard shortcut unlocks when conditions met (AC: #1)
  - [ ] In `packages/excalidraw/actions/actionElementLock.test.tsx`, add test inside `describe("element locking", ...)` block
  - [ ] Setup: render `<Excalidraw>` with 2 locked + 1 unlocked elements, no selection
  - [ ] Action: `fireEvent.keyDown(document, { key: "U", ctrlKey: true, shiftKey: true })`
  - [ ] Assert: `h.elements.map(el => el.locked)` equals `[false, false, false]`
  - [ ] Assert: `h.state.selectedElementIds` contains both previously-locked element IDs

- [ ] Test 2: Shortcut does nothing when no elements are locked (AC: #2)
  - [ ] Setup: render with 0 locked elements
  - [ ] Action: fire Ctrl+Shift+U keydown
  - [ ] Assert: `h.elements.map(el => el.locked)` unchanged (all false), `h.state.selectedElementIds` unchanged

- [ ] Test 3: Shortcut does nothing when elements are selected (AC: #3)
  - [ ] Setup: render with 1 locked element, select any unlocked element first
  - [ ] Action: fire Ctrl+Shift+U keydown
  - [ ] Assert: locked element remains locked, state unchanged

- [ ] Regression: Run all existing lock tests (AC: #4)
  - [ ] Confirm `actionToggleElementLock` (Ctrl+Shift+L) still works correctly
  - [ ] Confirm existing context-menu unlock-all tests still pass

## Dev Notes

### Critical: `KEYS.U` Is Missing — Must Add First

`packages/common/src/keys.ts` does **not** contain `U: "u"`. The `KEYS` object lists A C D E F G H I L O P Q R S T V X Y Z K W — U is absent. This is a **prerequisite** for everything else. Without it, the `keyTest` implementation will not compile cleanly and will require a raw string literal instead.

### Pattern: Follow `actionToggleElementLock`, Not `actionToggleMidpointSnapping`

Two `keyTest` styles exist in this codebase:

| Style | Where used | Key matching |
|---|---|---|
| `event.key.toLocaleLowerCase() === KEYS.X` | `actionToggleElementLock:143` and most actions | Latin-layout `event.key` |
| `event.code === CODES.M` | `actionToggleMidpointSnapping:25` | Physical key code (non-latin layouts) |

**Use the first style.** Both `actionUnlockAllElements` and `actionToggleElementLock` live in the same file. Consistency within the file is the priority. `CODES.U` does not exist and should not be added.

### Predicate Interaction — No Special Handling Needed

`actionUnlockAllElements` has a `predicate` (lines 161–167):
```ts
predicate: (elements, appState) => {
  const selectedElements = getSelectedElements(elements, appState);
  return (
    selectedElements.length === 0 &&
    elements.some((element) => element.locked)
  );
},
```
The Excalidraw action dispatch system evaluates `predicate` **before** calling `perform`. When the `keyTest` fires and `predicate` returns false, the action silently does nothing. This satisfies AC #2 and AC #3 automatically — no logic duplication needed in `keyTest`.

### i18n — No Locale Files Need Changing

`labels.elementLock.unlockAll` is already translated in all 50+ locale files. `en.json:163` reads `"Unlock all"`. Do not touch any locale file.

### HelpDialog: Use `t()` Not `getShortcutFromShortcutName()`

The adjacent `toggleElementLock` entry at line 458–461 uses an inline `getShortcutKey("CtrlOrCmd+Shift+L")` rather than `getShortcutFromShortcutName`. Match that pattern for consistency — both work, but inline is what the neighbour uses.

### Snapshot Risk

`packages/excalidraw/tests/__snapshots__/contextmenu.test.tsx.snap` is already modified on this branch. The unlock-all action is context-menu-driven; adding a `keyTest` does not affect context menu rendering. No snapshot update expected — but run `yarn test` to confirm.

### Project Structure Notes

- `packages/common/src/keys.ts` — shared constants package, exported to all packages via `@excalidraw/common`
- `packages/excalidraw/actions/` — all action files; `actionElementLock.ts` contains both lock actions in one file
- `packages/excalidraw/actions/shortcuts.ts` — shortcut name registry; `ShortcutName` is a TypeScript union that enforces only known `ActionName` values are registered
- `packages/excalidraw/components/HelpDialog.tsx` — single file, no sharding; `<Shortcut>` is a local component defined in the same file

### References

- Action implementation: `packages/excalidraw/actions/actionElementLock.ts:156–214`
- Reference keyTest pattern: `packages/excalidraw/actions/actionElementLock.ts:143–153`
- Keys constants: `packages/common/src/keys.ts:31–86`
- Shortcuts registry: `packages/excalidraw/actions/shortcuts.ts:10–122`
- Help Dialog lock entry: `packages/excalidraw/components/HelpDialog.tsx:458–461`
- Existing tests: `packages/excalidraw/actions/actionElementLock.test.tsx`
- i18n label: `packages/excalidraw/locales/en.json:163`

## Files to Change

| File | Change |
|---|---|
| `packages/common/src/keys.ts` | Add `U: "u"` between T and V (~line 69) |
| `packages/excalidraw/actions/actionElementLock.ts` | Append `keyTest` to `actionUnlockAllElements` (after line 213) |
| `packages/excalidraw/actions/shortcuts.ts` | Add to `ShortcutName` union + `shortcutMap` entry |
| `packages/excalidraw/components/HelpDialog.tsx` | Add `<Shortcut>` row after line 461 |
| `packages/excalidraw/actions/actionElementLock.test.tsx` | Add 3 keyboard shortcut test cases |

## Verification Checklist

- [ ] `yarn tsc --noEmit` passes with zero new errors
- [ ] `yarn workspace @excalidraw/excalidraw test actionElementLock` — all tests green including 3 new ones
- [ ] `yarn test` passes with no snapshot failures
- [ ] `grep -n '"u"' packages/common/src/keys.ts` returns the new `U: "u"` line
- [ ] No unrelated files modified

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
