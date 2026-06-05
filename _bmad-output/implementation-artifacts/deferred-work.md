# Deferred Work

## actionDuplicateInPlace — missing test: linear element isEditing guard

The early-exit branch `if (appState.selectedLinearElement?.isEditing) return false` in
`packages/excalidraw/actions/actionDuplicateInPlace.ts` has no unit test. A regression
there would be silent. Add a test that sets `selectedLinearElement.isEditing = true` and
asserts the element array is unchanged after the action runs.

Source: adversarial review finding, 2026-06-05.
