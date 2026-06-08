# Tasks: Add Keyboard Shortcut for Toggle Midpoint Snapping

## Pre-Implementation

- [x] Read `packages/excalidraw/actions/actionToggleMidpointSnapping.tsx` to confirm current state (no `keyTest`, `captureUpdate: NEVER`).
- [x] Read `packages/common/src/keys.ts` to confirm `M` is not yet defined in `CODES`.
- [x] Read `packages/excalidraw/actions/actionToggleObjectsSnapMode.tsx` to confirm the `Alt+S` `keyTest` pattern to replicate.
- [x] Read `packages/excalidraw/components/HelpDialog.tsx` around line 290–300 to confirm the insertion point for the new `<Shortcut>` entry.
- [x] Confirm `"labels.midpointSnapping"` key exists in `packages/excalidraw/locales/en.json`.

## Implementation

### Task 1 — Add `M` key constant
- [x] Open `packages/common/src/keys.ts`.
- [x] Add `M: "KeyM"` to the `CODES` object (between `H` and `V`).

### Task 2 — Add `keyTest` to the action
- [x] Open `packages/excalidraw/actions/actionToggleMidpointSnapping.tsx`.
- [x] Add `import { CODES, KEYS } from "@excalidraw/common";`.
- [x] Add `keyTest: (event) => !event[KEYS.CTRL_OR_CMD] && event.altKey && event.code === CODES.M,` to the `register({...})` call.

> **Implementation note:** The correct pattern uses `event.code === CODES.M` (physical key `"KeyM"`), not `event.key === KEYS.M`, following the same approach as `actionToggleObjectsSnapMode`. The `!event[KEYS.CTRL_OR_CMD]` guard prevents conflicts with Ctrl+Alt+M system shortcuts.

### Task 3 — Add shortcut to Help Dialog
- [x] Open `packages/excalidraw/components/HelpDialog.tsx`.
- [x] Locate the View section with other `Alt+*` snap shortcuts (around line 293–296).
- [x] Added:
  ```tsx
  <Shortcut
    label={t("labels.midpointSnapping")}
    shortcuts={[getShortcutKey("Alt+M")]}
  />
  ```
  Inserted after the `Alt+S` (objectsSnapMode) entry.

## Testing

### Task 4 — Write tests
- [x] Created `packages/excalidraw/actions/actionToggleMidpointSnapping.test.tsx` with 4 tests.

> **Implementation note:** Tests use `act(() => h.app.actionManager.executeAction(actionToggleMidpointSnapping))` for behavior tests (not `fireEvent.keyDown`) because jsdom does not propagate `keydown` from `document` to the Excalidraw App's internal handler. Shortcut-matching tests call `keyTest!(event as any, h.state, h.elements, h.app)` directly.

```typescript
import React from "react";
import { Excalidraw } from "../index";
import { act, render } from "../tests/test-utils";
import { actionToggleMidpointSnapping } from "./actionToggleMidpointSnapping";

const { h } = window;

describe("actionToggleMidpointSnapping", () => {
  beforeEach(async () => {
    await render(<Excalidraw />);
  });

  it("toggles isMidpointSnappingEnabled on", () => {
    const before = h.state.isMidpointSnappingEnabled;
    act(() => { h.app.actionManager.executeAction(actionToggleMidpointSnapping); });
    expect(h.state.isMidpointSnappingEnabled).toBe(!before);
  });

  it("restores original state on second execution", () => {
    const before = h.state.isMidpointSnappingEnabled;
    act(() => { h.app.actionManager.executeAction(actionToggleMidpointSnapping); });
    act(() => { h.app.actionManager.executeAction(actionToggleMidpointSnapping); });
    expect(h.state.isMidpointSnappingEnabled).toBe(before);
  });

  it("keyTest matches Alt+M without Ctrl/Cmd", () => {
    const event = new KeyboardEvent("keydown", { altKey: true, code: "KeyM" });
    expect(actionToggleMidpointSnapping.keyTest!(event as any, h.state, h.elements, h.app)).toBe(true);
  });

  it("keyTest does not match Ctrl+Alt+M", () => {
    const event = new KeyboardEvent("keydown", { ctrlKey: true, altKey: true, code: "KeyM" });
    expect(actionToggleMidpointSnapping.keyTest!(event as any, h.state, h.elements, h.app)).toBe(false);
  });
});
```

## Verification

- [x] `yarn test:typecheck` — passes with zero errors.
- [x] `yarn test:code` — passes with zero ESLint errors.
- [x] `yarn test:app actionToggleMidpointSnapping` — 4/4 tests pass.
- [ ] Manual check: start `yarn start`, press `Alt+M` in the canvas, confirm midpoint snapping toggles.
- [ ] Manual check: open Help Dialog (`?`), confirm `Alt+M` appears in the View section next to "Snap to midpoints".

## Done Definition

The change is complete when:
- `Alt+M` toggles midpoint snapping in the live canvas.
- The shortcut appears in the Help Dialog.
- All three verification commands pass.
- New test covers the toggle behavior and shortcut-matching predicate.
