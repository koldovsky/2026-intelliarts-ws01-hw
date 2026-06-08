---
name: add-excalidraw-action
description: Add a new Excalidraw action — creates the action file, registers the name, re-exports it, and writes a test. Use when the user wants to add a new command, toolbar toggle, or property control.
license: MIT
metadata:
  author: project
  version: "1.0"
---

Add a new Excalidraw action to `packages/excalidraw/actions/`.

**Inputs**: action name (camelCase, e.g. `toggleFoo`), trigger type (`keyboard` / `menu` / `panel` / any combination), whether it is undoable (yes → `IMMEDIATELY`, no → `NEVER`).

**Steps**

1. **Create the action file**

   Create `packages/excalidraw/actions/action<Name>.ts` (or `.tsx` if it needs JSX for `PanelComponent`).

   Minimum required shape:

   ```ts
   import { CaptureUpdateAction } from "@excalidraw/element";
   import { register } from "./register";

   export const action<Name> = register({
     name: "<actionName>",            // must match the ActionName union exactly
     label: "labels.<actionName>",    // i18n key, or a plain string
     trackEvent: { category: "element" }, // pick the right category (toolbar/element/canvas/export/menu)
     perform: (elements, appState, _formData, app) => {
       // return false to cancel
       return {
         elements,   // omit if unchanged
         appState,   // omit if unchanged
         captureUpdate: CaptureUpdateAction.IMMEDIATELY, // or NEVER / EVENTUALLY
       };
     },
   });
   ```

   Optional fields to add as needed:
   - `predicate`: `(elements, appState, appProps, app) => boolean` — controls enable/disable.
   - `checked`: `(appState) => boolean` — for toggle actions.
   - `keyTest`: `(event, appState, elements, app) => boolean` — keyboard shortcut. When adding a shortcut also add an entry to `packages/excalidraw/actions/shortcuts.ts`.
   - `icon`: import from `packages/excalidraw/components/icons.tsx`.
   - `PanelComponent`: a React component for sidebar UI; rename the file to `.tsx`.
   - `viewMode: true` if the action should work in view-only mode.

   **Import rules** (enforced by ESLint — violations are errors):
   - Use `@excalidraw/element`, `@excalidraw/common`, `@excalidraw/math` for shared utilities.
   - Never import directly from `jotai`; use `editor-jotai` inside this package.
   - Use `import type` for type-only imports.

2. **Add the name to the `ActionName` union**

   Edit `packages/excalidraw/actions/types.ts` — append `| "<actionName>"` to the `ActionName` union (line ~148). Keep it alphabetical with nearby entries.

3. **Re-export from the barrel**

   Edit `packages/excalidraw/actions/index.ts` — add an export line:

   ```ts
   export { action<Name> } from "./action<Name>";
   ```

   Place it near thematically related exports.

4. **Wire the action (optional, depends on trigger)**

   - **Keyboard only**: `keyTest` in the file is sufficient — the `ActionManager` picks it up automatically.
   - **Context menu**: add the `name` string to the relevant context-menu array in `packages/excalidraw/components/App.tsx` (`renderContextMenu`).
   - **Toolbar / main menu**: add `renderAction("<actionName>")` call in the appropriate panel component under `packages/excalidraw/components/`.
   - **Command palette**: already included automatically when `keywords` is set.

5. **Write a test**

   Create `packages/excalidraw/tests/action<Name>.test.tsx` (or add cases to the nearest existing test file). Model on `actionFlip.test.tsx` or `actionElementLock.test.tsx`:

   ```ts
   import { render } from "../tests/test-utils";
   import { Excalidraw } from "../index";
   // ...
   describe("action<Name>", () => {
     it("does X when Y", async () => {
       // arrange, act via UI helpers or actionManager.executeAction, assert
     });
   });
   ```

6. **Verify**

   ```bash
   yarn test:typecheck
   yarn test:code
   yarn test --reporter=verbose <path-to-test-file>
   ```

   Full gate before declaring done: `yarn test:all`.

**Common mistakes to avoid**

- Forgetting to add the name to `ActionName` — TypeScript will catch it, but only on `tsc`.
- Using `CaptureUpdateAction.IMMEDIATELY` for ephemeral/remote actions — use `NEVER` there.
- Importing `jotai` directly instead of via `editor-jotai`.
- Barrel imports inside `packages/excalidraw/` — use direct relative paths.
