# Skills Research — Excalidraw

## Identified Repeatable Workflows

### 1. Adding a New Element Type (Shape)

**Frequency:** Occasional, but the process is identical every time.

**Steps involved:**

1. Define the type in `packages/element/src/types.ts` (add to union, define
   type-specific interface).
2. Add a type guard in `packages/element/src/typeChecks.ts`.
3. Create a factory function in `packages/element/src/newElement.ts`.
4. Add rendering logic — shape generation in `packages/element/src/shape.ts`,
   drawing in `packages/excalidraw/renderer/staticScene.ts`.
5. Register a toolbar entry and action in `packages/excalidraw/actions/`.
6. Add to the tool palette in `packages/excalidraw/components/`.
7. Write tests.

**Pain point:** Missing any one step causes subtle bugs (e.g., element renders
but can't be selected, or can be created but not serialized). The checklist is
long and spans 4 packages.

### 2. Adding a New Action (Keyboard Shortcut / Toolbar Operation)

**Frequency:** Common — every new feature or UI operation needs an action.

**Steps involved:**

1. Create a new file in `packages/excalidraw/actions/` (or add to existing).
2. Implement the `Action` interface: `name`, `perform`, optional `keyTest`,
   optional `PanelComponent`.
3. Call `register()` to add it to the global list.
4. Export it from `packages/excalidraw/actions/index.ts`.
5. Add i18n key to `packages/excalidraw/locales/en.json` (and percentages.json).
6. Write tests.

**Pain point:** Forgetting the export or the locale key. The pattern is always
the same but touches multiple files.

---

## Proposed Agent Skills

### Skill 1: `new-element-type`

**What it automates:** The full checklist for adding a new primitive element
type. Given a name (e.g., `hexagon`) and basic shape parameters, the skill
would scaffold:

- Type definition stub in `types.ts`
- Type guard in `typeChecks.ts`
- Factory function in `newElement.ts`
- Placeholder rendering in `shape.ts`
- Action registration with toolbar icon
- Test file skeleton

**Why it's valuable:** This is the highest-risk repeatable task in the repo —
it spans 4+ packages and 7+ files. A skill ensures no step is skipped and
enforces the project's conventions (branded types, `register()` pattern,
`readonly` arrays, soft-delete support).

### Skill 2: `new-action`

**What it automates:** Scaffolding a new action with proper registration.
Given a name, keyboard shortcut, and description, the skill would:

- Create the action file with `register()` call
- Add the export to `actions/index.ts`
- Add the i18n key to `en.json`
- Create a test file skeleton

**Why it's valuable:** Actions are the most frequently added artifact in the
codebase (~70 exist today). The boilerplate is mechanical — name, keyTest,
perform function, registration, export, locale. A skill removes the
copy-paste-and-forget-one-step failure mode.

---

## Summary

| Skill | Workflow | Files Touched | Risk if Manual |
|-------|----------|---------------|----------------|
| `new-element-type` | Add a new drawable shape | 7+ across 4 packages | High — silent bugs if steps missed |
| `new-action` | Add a new user operation | 4 files in 1 package | Medium — forgotten export or locale |
