## Context

Excalidraw's keyboard actions are wired through the `register()` helper in `packages/excalidraw/actions/register.ts`. Each registered action may include a `keyTest(event)` predicate; the action manager calls every registered action's `keyTest` on each `keydown` event and executes the first match whose `predicate` (if any) also passes.

The `wrapSelectionInFrame` action already exists with a `predicate` that guards against empty selections and frame-in-selection. It just lacks `keyTest`.

The constants for key codes live in `packages/common/src/keys.ts` (`CODES` for `event.code` values, `KEYS` for `event.key` values). The key `F` is present in `KEYS` but absent from `CODES`; the grid-mode shortcut pattern (`CODES.QUOTE`) shows that `event.code` comparisons are preferred for letter keys to avoid locale layout issues.

## Goals / Non-Goals

**Goals:**
- Wire `Ctrl+Shift+F` / `Cmd+Shift+F` to `actionWrapSelectionInFrame` with minimal, focused changes
- Expose the shortcut in the `shortcutMap` so help dialogs show it

**Non-Goals:**
- Changing the frame-creation logic itself
- Adding UI affordances beyond what the shortcut map already provides
- Supporting custom shortcut remapping

## Decisions

**Use `event.code === CODES.F` (not `event.key`).**
Rationale: `event.code` is layout-independent; `event.key` changes with keyboard locale. All existing letter shortcuts that use code-based matching (`CODES.C`, `CODES.D`, etc.) set a `CODES` constant. Adding `F: "KeyF"` follows the same pattern.

**Shortcut: `Ctrl+Shift+F` / `Cmd+Shift+F`.**
Rationale: `F` alone is not free (browser Find), `Ctrl+F` opens search in Excalidraw, `Ctrl+Shift+F` is unused across all existing shortcuts. Shift modifier aligns with "wrap" as a compound/structural action (similar to `Ctrl+Shift+G` for ungroup).

## Risks / Trade-offs

- [Risk] Future browser or OS shortcut conflict with `Ctrl+Shift+F` → Mitigation: the action manager checks `event.defaultPrevented`; if a conflict surfaces it can be rekeyed in a follow-up.
- [Risk] The `CODES.F` constant is shared across packages — adding it is safe since it is purely additive.

## Open Questions

None — the scope is narrow and fully resolved by the existing action infrastructure.