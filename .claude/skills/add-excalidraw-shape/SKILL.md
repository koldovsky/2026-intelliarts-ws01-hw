---
name: add-excalidraw-shape
description: Add a new primitive shape/element type to Excalidraw — covers the full cross-package touch-points from type definition through rendering and tooling. Use when the user wants to add a new drawable shape.
license: MIT
metadata:
  author: project
  version: "1.0"
---

Add a new primitive shape/element type to the Excalidraw monorepo.

**Inputs**: shape name (e.g. `hexagon`), whether it is a closed polygon or a linear/open shape, its geometric description (sides, curves, etc.).

**Layering rule (hard — ESLint errors on violation)**: Changes to geometry/element logic go in `@excalidraw/element` or `@excalidraw/math`. Lower-layer packages must never import runtime code from `@excalidraw/excalidraw`. Only type-only imports across that boundary are tolerated.

---

**Steps**

### 1. Extend the element type system (`packages/element/src/`)

**`types.ts`** — add the new literal to the element type union:

```ts
// Find ExcalidrawElementType or the ShapeType union and append:
| "hexagon"
```

Also add the specific element interface if it carries extra props:

```ts
export type ExcalidrawHexagonElement = _ExcalidrawElementBase & {
  type: "hexagon";
};
```

And union it into `ExcalidrawElement`.

**`typeChecks.ts`** — add a type guard:

```ts
export const isHexagonElement = (
  element: ExcalidrawElement,
): element is ExcalidrawHexagonElement => element.type === "hexagon";
```

### 2. Add an element constructor (`packages/element/src/newElement.ts`)

Model on the nearest existing shape constructor (`newRectangleElement`, `newEllipseElement`, …):

```ts
export const newHexagonElement = (
  opts: ElementConstructorOpts,
): NonDeleted<ExcalidrawHexagonElement> =>
  newElementWith(
    { ...newElementBase("hexagon", opts) },
    {},
  ) as NonDeleted<ExcalidrawHexagonElement>;
```

### 3. Geometry — bounds and hit-testing

**`packages/element/src/bounds.ts`** — add a case in `getElementBounds` / `getCommonBounds` for the new type (compute AABB from the shape's vertices).

**`packages/element/src/collision.ts`** — add a hit-test case in `hitTest` (point-in-polygon or point-near-path). Place geometry helpers for the new shape in `packages/math/src/` if they are reusable.

### 4. Rendering

**`packages/element/src/shape.ts`** — add a case in `_generateElementShape` that returns the RoughJS descriptor:

```ts
case "hexagon": {
  const points = hexagonPoints(element.width, element.height);
  return generator.polygon(points, options);
}
```

Put the `hexagonPoints` helper in `packages/math/src/hexagon.ts` and export it from `packages/math/src/index.ts`.

**`packages/element/src/renderElement.ts`** — if the shape needs a canvas or SVG path that differs from the default ShapeCache path, add a case in the relevant render switch. For most polygon shapes the default `ShapeCache`-based path is sufficient (no extra code needed).

### 5. Register the tool in the editor (`packages/excalidraw/`)

**`packages/excalidraw/components/shapes.tsx`** — add an entry to the `SHAPES` array:

```ts
{
  value: "hexagon",
  icon: HexagonIcon,           // import from components/icons.tsx (create if missing)
  key: KEYS.H,                 // pick an unused shortcut key
  numericKey: CODES.DIGIT8,    // optional
  fillable: true,
}
```

**`packages/excalidraw/components/App.tsx`** — wire pointer-down creation in `handleToolChange` / `createGenericElementOnPointerDown` (search for an existing shape to see the pattern; typically a one-line case adding the constructor call).

### 6. (Optional) Icon

Add an SVG icon component to `packages/excalidraw/components/icons.tsx` following the existing pattern (`HexagonIcon`). Icons use a standard `<path>` inside the shared `tablerIconProps` wrapper.

### 7. Write tests

Create `packages/excalidraw/tests/shapes/hexagon.test.tsx` (or add to `dragCreate.test.tsx`). Use the helpers in `packages/excalidraw/tests/helpers/ui.ts` and `api.ts`:

```ts
it("creates a hexagon on drag", async () => {
  const { getByTitle } = await render(<Excalidraw />);
  UI.clickTool("hexagon");
  Mouse.down(10, 10);
  Mouse.up(50, 50);
  const elements = API.getElements();
  expect(elements[0].type).toBe("hexagon");
});
```

### 8. Verify

```bash
yarn test:typecheck
yarn test:code
yarn test --reporter=verbose packages/excalidraw/tests/shapes/
```

Full gate before declaring done: `yarn test:all`.

---

**Common mistakes to avoid**

- Skipping `typeChecks.ts` — downstream code relies on type guards, not `element.type === "…"` literals.
- Putting geometry helpers in `packages/excalidraw/` instead of `packages/math/` — this violates the layering rule.
- Forgetting to export new symbols from the package's `index.ts` when they are needed cross-package.
- Using barrel imports inside `packages/excalidraw/` — use direct relative paths.
- Hard-coding pixel values in bounds/hit-test instead of deriving them from `element.width`/`element.height`.
