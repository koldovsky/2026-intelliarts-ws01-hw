# Skill: new-element-type

## Description
Scaffold all files needed to add a new primitive element type to Excalidraw.

## When to Use
When the user asks to add a new shape or element type (e.g., "add a hexagon
element", "create a star shape", "add a new trapezoid type").

## Instructions

Given a new element type name (e.g., `hexagon`), perform the following steps
in order. Use PascalCase for type names and camelCase for variables.

### Step 1: Define the type (`packages/element/src/types.ts`)

Add a new type alias following the existing pattern:

```typescript
export type Excalidraw<Name>Element = _ExcalidrawElementBase & {
  type: "<name>";
};
```

Add `"<name>"` to the `ExcalidrawElement` union type.

If the element has type-specific properties (e.g., `sides` for a polygon),
add them as `Readonly<{ ... }>`.

### Step 2: Add type guard (`packages/element/src/typeChecks.ts`)

Add a type guard function:

```typescript
export const is<Name>Element = (
  element: ExcalidrawElement | null,
): element is Excalidraw<Name>Element => {
  return element?.type === "<name>";
};
```

Import the new type at the top of the file.

### Step 3: Add factory function (`packages/element/src/newElement.ts`)

Add a creation function following the pattern of `newElement()`:

```typescript
export const new<Name>Element = (
  opts: ElementConstructorOpts,
): NonDeleted<Excalidraw<Name>Element> => {
  // ... use _newElementBase() then spread with type-specific defaults
};
```

### Step 4: Add shape generation (`packages/element/src/shape.ts`)

Add a case to the shape generation switch to define how the element renders
via Rough.js. Look at existing cases (rectangle, diamond, ellipse) for the
pattern.

### Step 5: Register an action (`packages/excalidraw/actions/`)

Create `action<Name>.ts` with a `register()` call that:
- Sets `activeTool` to the new element type
- Defines a `keyTest` if a keyboard shortcut is desired
- Optionally provides a `PanelComponent` or `icon`

Export the action from `packages/excalidraw/actions/index.ts`.

### Step 6: Add locale key (`packages/excalidraw/locales/en.json`)

Add a label entry: `"toolBar.<name>": "<Name>"`.

### Step 7: Write tests

Create a test file in the appropriate `tests/` directory covering:
- Element creation via factory function
- Type guard returns `true` for the new type and `false` for others
- Basic rendering (element appears on canvas after creation)

### Final Checks

1. Run `yarn test:typecheck` — must pass with no errors
2. Run `yarn test:app --watch=false` — all tests must pass
3. Verify the new element does NOT break existing element serialization
