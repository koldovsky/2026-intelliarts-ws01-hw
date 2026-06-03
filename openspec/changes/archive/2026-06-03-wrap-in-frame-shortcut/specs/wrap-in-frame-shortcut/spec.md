## ADDED Requirements

### Requirement: Keyboard shortcut triggers Wrap Selection in Frame
The system SHALL bind `Ctrl+Shift+F` (Windows/Linux) and `Cmd+Shift+F` (macOS) to the existing `wrapSelectionInFrame` action. When the shortcut fires, the action SHALL behave identically to triggering the action via the context menu.

#### Scenario: Shortcut wraps selected non-frame elements
- **WHEN** one or more non-frame elements are selected
- **WHEN** the user presses `Ctrl+Shift+F` (or `Cmd+Shift+F` on macOS)
- **THEN** the selected elements SHALL be wrapped in a newly created frame with 16px padding on all sides
- **THEN** the new frame SHALL become the selected element

#### Scenario: Shortcut is a no-op when no elements are selected
- **WHEN** no elements are selected on the canvas
- **WHEN** the user presses `Ctrl+Shift+F` (or `Cmd+Shift+F` on macOS)
- **THEN** nothing SHALL happen (predicate rejects the action)

#### Scenario: Shortcut is a no-op when a frame element is selected
- **WHEN** a frame element is among the selected elements
- **WHEN** the user presses `Ctrl+Shift+F` (or `Cmd+Shift+F` on macOS)
- **THEN** nothing SHALL happen (predicate rejects the action)

### Requirement: Shortcut is discoverable in the shortcuts map
The system SHALL register the new shortcut string in the `shortcutMap` so that shortcut-help UIs and accessibility tooling can display it.

#### Scenario: Shortcut appears in shortcutMap
- **WHEN** `getShortcutFromShortcutName("wrapSelectionInFrame")` is called
- **THEN** it SHALL return a non-empty shortcut string representing `Ctrl+Shift+F` / `Cmd+Shift+F`