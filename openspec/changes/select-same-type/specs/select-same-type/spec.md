# Spec: Select Same Type action

**Action name:** `selectSameType`  
**Keyboard shortcut:** `Alt+T`

## Inputs

| Input | Description |
|-------|-------------|
| `elements` | Full ordered element array from the scene |
| `appState.selectedElementIds` | Currently selected element IDs |

## Behaviour

### Case 1 — nothing selected

- **Given** `selectedElementIds` is empty  
- **When** `Alt+T` is pressed  
- **Then** action returns `false` (no state change)

### Case 2 — single element selected

- **Given** one element of type `rectangle` is selected  
- **When** `Alt+T` is pressed  
- **Then** all non-deleted, non-locked `rectangle` elements are added to the selection

### Case 3 — multiple elements of different types selected

- **Given** a `rectangle` and an `ellipse` are both selected  
- **When** `Alt+T` is pressed  
- **Then** all non-deleted, non-locked `rectangle` **and** `ellipse` elements are added to the selection

### Case 4 — deleted elements are excluded

- **Given** a selected `rectangle` and another deleted `rectangle` exist  
- **When** `Alt+T` is pressed  
- **Then** the deleted element is **not** added to the selection

### Case 5 — locked elements are excluded

- **Given** a selected `rectangle` and another locked `rectangle` exist  
- **When** `Alt+T` is pressed  
- **Then** the locked element is **not** added to the selection

## Output

`ActionResult` with updated `appState.selectedElementIds` containing the union
of the original selection and all same-type elements (filtered per cases above).
`captureUpdate` is set to `CaptureUpdateAction.IMMEDIATELY`.
