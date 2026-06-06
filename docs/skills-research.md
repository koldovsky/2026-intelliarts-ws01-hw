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

## Skill 2: "Validate canvas export workflows"

**Why**: Excalidraw has a complex export pipeline (PNG metadata embedding, SVG generation, clipboard copy, backend shareable links) with multiple code paths that are easy to break. A dedicated workflow catches export regressions faster than generic typecheck + test.

**Workflow automated**:

1. Locate relevant export tests in `packages/excalidraw/tests/` (export tests use `render` + snapshot matching)
2. `yarn test:code` — check for ESLint errors
3. `yarn typecheck` — verify TypeScript compilation
4. `yarn test -- --run packages/excalidraw/tests/export*.test.tsx` — run export-specific tests
5. Verify export output: PNG chunk extraction, SVG DOM structure, clipboard DataTransfer content
