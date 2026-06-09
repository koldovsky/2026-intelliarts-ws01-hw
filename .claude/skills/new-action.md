# Skill: new-action

## Description
Scaffold a new Excalidraw action with registration, export, locale key,
and test skeleton.

## When to Use
When the user asks to add a new operation, keyboard shortcut, or toolbar
button (e.g., "add a toggle dark mode shortcut", "create an action to
reset element colors", "add a toolbar button for centering on selection").

## Instructions

Given an action name, optional keyboard shortcut, and description, perform
the following steps.

### Step 1: Create the action file

Create `packages/excalidraw/actions/action<Name>.ts` (or `.tsx` if it has a
`PanelComponent`).

Follow this template based on the existing pattern
(`actionToggleGridMode.tsx`):

```typescript
import { CODES, KEYS } from "@excalidraw/common";
import { CaptureUpdateAction } from "@excalidraw/element";
import { register } from "./register";

export const action<Name> = register({
  name: "<actionName>",
  label: "labels.<actionName>",
  keywords: [/* searchable keywords */],
  trackEvent: {
    category: "<category>",  // "canvas", "element", "export", etc.
  },
  perform(elements, appState) {
    return {
      appState: {
        ...appState,
        // state changes here
      },
      captureUpdate: CaptureUpdateAction.EVENTUALLY,
    };
  },
  // Optional keyboard shortcut:
  // keyTest: (event) => event[KEYS.CTRL_OR_CMD] && event.code === CODES.KEY,
});
```

Key rules:
- Always use `register()` from `./register`
- Return `{ appState, captureUpdate }` or `{ elements, appState, captureUpdate }`
- Never call `setState()` directly — return the delta
- Use `CaptureUpdateAction.EVENTUALLY` for UI state,
  `CaptureUpdateAction.IMMEDIATELY` for element mutations

### Step 2: Export from index

Add the export to `packages/excalidraw/actions/index.ts`:

```typescript
export { action<Name> } from "./action<Name>";
```

### Step 3: Add locale key

Add to `packages/excalidraw/locales/en.json`:

```json
"labels.<actionName>": "<Human-readable label>"
```

Also add to `packages/excalidraw/locales/percentages.json` with value `100`.

### Step 4: Write test

Create `packages/excalidraw/actions/action<Name>.test.ts`:

```typescript
import { vi } from "vitest";
// Import test utilities from the project's test setup

describe("action<Name>", () => {
  it("should <describe expected behavior>", () => {
    // Test the action's perform() function
  });
});
```

### Step 5: (Optional) Add to toolbar or menu

If the action needs a UI entry point beyond keyboard shortcut:
- Add an icon to `packages/excalidraw/components/icons.tsx`
- Reference it in the action via the `icon` property
- Or add a `PanelComponent` for sidebar/toolbar rendering

### Final Checks

1. Run `yarn test:typecheck` — must pass
2. Run `yarn test:app --watch=false` — all tests must pass
3. Run `yarn test:code` — ESLint must pass with zero warnings
