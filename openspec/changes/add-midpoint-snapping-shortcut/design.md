# Design: Add Keyboard Shortcut for Toggle Midpoint Snapping

## Architecture Context

This change lives entirely within `packages/excalidraw/` (the core library package) and `packages/common/` (shared constants). No changes are needed in `excalidraw-app/`.

The keyboard shortcut system works as follows:
1. `App.tsx` `onKeyDown` handler delegates to `ActionManager.handleKeyDown()` (line 5040).
2. `ActionManager.handleKeyDown()` iterates all registered actions sorted by `keyPriority`, calls each action's `keyTest(event, appState, elements, app)`, and executes the first (and only) match.
3. Actions are registered at module load time via `register()` (`packages/excalidraw/actions/register.ts`).
4. Key constants are centralised in `packages/common/src/keys.ts` as the `KEYS` (event.key values) and `CODES` (event.code values) objects.

## Existing Action (verified from source)

File: `packages/excalidraw/actions/actionToggleMidpointSnapping.tsx`

```typescript
export const actionToggleMidpointSnapping = register({
  name: "midpointSnapping",
  label: "labels.midpointSnapping",
  viewMode: false,
  trackEvent: {
    category: "canvas",
    predicate: (appState) => !appState.isMidpointSnappingEnabled,
  },
  perform(elements, appState) {
    return {
      appState: {
        ...appState,
        isMidpointSnappingEnabled: !this.checked!(appState),
      },
      captureUpdate: CaptureUpdateAction.NEVER,
    };
  },
  checked: (appState) => appState.isMidpointSnappingEnabled,
});
```

Key observations:
- `captureUpdate: CaptureUpdateAction.NEVER` — this is a UI preference toggle, not a user-content action. Correct; it must not pollute the undo stack.
- No `keyTest` property exists — this is the gap to fill.
- `viewMode: false` — the shortcut will correctly be disabled in view-only mode (ActionManager checks this).
- `ActionName` entry `"midpointSnapping"` already exists in `types.ts` — no union change needed.
- The action is already exported and registered — no barrel change needed.

## Reference Pattern

`actionToggleObjectsSnapMode` (`Alt+S`) — identical toggle structure with `keyTest`:

```typescript
keyTest: (event) =>
  !event[KEYS.CTRL_OR_CMD] && event.altKey && event.code === CODES.S,
```

This is the exact pattern to replicate for `Alt+M`. Note: the pattern uses `event.code` (physical key position) rather than `event.key` (character value) to ensure correct behaviour on non-Latin keyboard layouts.

## Changes Required

### 1. `packages/common/src/keys.ts`

Add `M` to the `CODES` object (between `H` and `V`, maintaining the existing grouping):

```typescript
// Before:
H: "KeyH",
V: "KeyV",

// After:
H: "KeyH",
M: "KeyM",
V: "KeyV",
```

`CODES.M` is not currently defined. Using `event.code` (`"KeyM"`) rather than `event.key` ensures the shortcut fires on the physical `M` key regardless of keyboard layout, consistent with all other Alt+* snap toggle shortcuts.

### 2. `packages/excalidraw/actions/actionToggleMidpointSnapping.tsx`

Add `keyTest` to the registered action object:

```typescript
import { CODES, KEYS } from "@excalidraw/common";
import { CaptureUpdateAction } from "@excalidraw/element";

export const actionToggleMidpointSnapping = register({
  name: "midpointSnapping",
  label: "labels.midpointSnapping",
  viewMode: false,
  trackEvent: {
    category: "canvas",
    predicate: (appState) => !appState.isMidpointSnappingEnabled,
  },
  perform(elements, appState) {
    return {
      appState: {
        ...appState,
        isMidpointSnappingEnabled: !this.checked!(appState),
      },
      captureUpdate: CaptureUpdateAction.NEVER,
    };
  },
  checked: (appState) => appState.isMidpointSnappingEnabled,
  keyTest: (event) =>
    !event[KEYS.CTRL_OR_CMD] && event.altKey && event.code === CODES.M,
});
```

Both `CODES` and `KEYS` are imported from `@excalidraw/common`. `KEYS.CTRL_OR_CMD` evaluates to `"metaKey"` on macOS and `"ctrlKey"` on other platforms, preventing conflicts with system shortcuts like `Ctrl+Alt+M`.

### 3. `packages/excalidraw/components/HelpDialog.tsx`

Add a `<Shortcut>` entry in the "View" section alongside the other `Alt+*` snap/mode toggles (around line 293–296):

```tsx
<Shortcut
  label={t("labels.midpointSnapping")}
  shortcuts={[getShortcutKey("Alt+M")]}
/>
```

The i18n key `"labels.midpointSnapping"` is already defined in `packages/excalidraw/locales/en.json` as `"Snap to midpoints"` (line 192). No locale change needed.

## No-Change Areas

- `packages/excalidraw/actions/types.ts` — `"midpointSnapping"` already in `ActionName` union.
- `packages/excalidraw/actions/index.ts` — action already exported.
- `excalidraw-app/` — no app-layer changes needed.
- `packages/element/src/` — no element mutations involved.
- Firebase / collab layer — not involved; this is a local UI preference.

## Import Rules to Respect

- Import `CODES` and `KEYS` from `@excalidraw/common` (not from a relative path to common).
- Import `CaptureUpdateAction` from `@excalidraw/element` (already present in the file).
- Do not import directly from `jotai` — not needed here.

## Conflict Verification

`Alt+M` searched across all `keyTest` predicates and App.tsx hardcoded handlers — no existing match found. Safe to use.