# Skills Research — Excalidraw Monorepo

## Skill 1: "Add a new element type"

**Why**: Adding a new shape (e.g. parallelogram, hexagon) follows a repetitive multi-file pattern. Automating it reduces errors and context switching.

**Workflow automated**:

1. Define the type union in `packages/element/src/types.ts`
2. Create factory function in `packages/element/src/newElement.ts` following `newRectangleElement()` / `newDiamondElement()` pattern
3. Add render branch in `packages/element/src/renderElement.ts` — dispatch by `element.type`
4. Register the tool in toolbar (check `packages/excalidraw/components/` for tool button registration)
5. Add keyboard shortcut if applicable (`packages/excalidraw/keys.ts` + action in `packages/excalidraw/actions/`)
6. Add test coverage for the new element (creation, rendering, selection)

**Files touched (typical)**: 4–7 files across 2 packages

## Skill 2: "Run verification suite"

**Why**: Multiple verify steps are needed before committing. A single command chain with error feedback is faster than running each manually.

**Workflow automated**:

1. `yarn lint` — check for lint errors
2. `yarn typecheck` — verify TypeScript compilation
3. `yarn test:coverage` — run tests with coverage report
4. Report summary: pass/fail per step, coverage delta, actionable errors
