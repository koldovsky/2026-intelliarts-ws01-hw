## Context

Excalidraw models every user command as an `Action` registered through `register({...})` in `packages/excalidraw/actions/`. The existing `actionSelectAll` (Ctrl/Cmd+A) already does the hard parts of a bulk selection: filtering out deleted, locked, and container-bound text elements, and running `selectGroupsForSelectedElements` so group membership stays consistent. "Select similar" is the same operation with one extra filter - element `type` must match the current selection. So the design is to clone `actionSelectAll`'s shape and add the type filter, rather than invent anything new.

## Goals / Non-Goals

**Goals:**

- Add one action that selects all elements sharing a type with the current selection, reusing the editor's existing selection plumbing.
- Give it a non-colliding keyboard shortcut and make it discoverable.
- Cover the behavior with a unit test that runs through the public action path.

**Non-Goals:**

- No UI redesign, no context-menu changes (avoids snapshot churn in `App.tsx`).
- No "select similar by style" (same stroke/fill) - this is type-only for now.
- No change to `actionSelectAll` or any existing spec.

## Decisions

- Mirror `actionSelectAll` instead of generalizing it. A shared helper would touch a stable, well-tested file for little gain. Cloning keeps the change additive and the diff reviewable. Alternative considered: extract a `selectElementsBy(predicate)` helper and have both actions call it - rejected as over-engineering for one extra predicate.
- Shortcut Ctrl/Cmd+Shift+A. Verified free against `shortcuts.ts` and every `keyTest`. It reads as "select all, but narrowed", which is a useful mnemonic. Alternatives (a bare letter, Alt-combo) are either taken or less memorable.
- Match the key with `event.key.toLowerCase() === KEYS.A` rather than a key code. `CODES` has no `A` entry, and adding one would touch the shared `@excalidraw/common` package for no behavioral reason. With Shift held, `event.key` is `"A"`, so lower-casing keeps the test correct without widening the change surface.
- Compute selected types into a `Set<string>`, then filter the full element list by membership. O(n) over elements, which is what `actionSelectAll` already does.

## Risks / Trade-offs

- [Type-only selection may surprise users who expect "same style"] -> Scope is documented in the proposal and the label; a style-based variant can be a later change.
- [A future shortcut could collide with Ctrl/Cmd+Shift+A] -> Registering it in `shortcutMap` makes the binding visible in the help dialog, so a future author sees it is taken.
- [`actionSelectAll` filtering could drift from this clone over time] -> The test pins the shared behavior (locked excluded, container text excluded), so drift surfaces as a failing test.
