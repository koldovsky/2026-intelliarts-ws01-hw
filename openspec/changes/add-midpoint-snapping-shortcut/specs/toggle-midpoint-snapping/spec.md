## ADDED Requirements

### Requirement: Alt+M keyboard shortcut toggles midpoint snapping
The editor SHALL toggle `isMidpointSnappingEnabled` in AppState when the user presses `Alt+M` while the canvas is focused and the editor is not in view-only mode.

#### Scenario: Pressing Alt+M enables midpoint snapping when it is off
- **WHEN** `isMidpointSnappingEnabled` is `false` and the user presses `Alt+M`
- **THEN** `isMidpointSnappingEnabled` becomes `true`

#### Scenario: Pressing Alt+M disables midpoint snapping when it is on
- **WHEN** `isMidpointSnappingEnabled` is `true` and the user presses `Alt+M`
- **THEN** `isMidpointSnappingEnabled` becomes `false`

#### Scenario: Pressing Alt+M twice returns to the original state
- **WHEN** the user presses `Alt+M` twice in succession
- **THEN** `isMidpointSnappingEnabled` returns to its value before the first press

#### Scenario: Shortcut does not fire in view-only mode
- **WHEN** `viewModeEnabled` is `true` and the user presses `Alt+M`
- **THEN** `isMidpointSnappingEnabled` remains unchanged

#### Scenario: Shortcut does not affect the undo stack
- **WHEN** the user presses `Alt+M` to toggle midpoint snapping
- **THEN** no new entry is added to the undo history (the toggle cannot be undone with Ctrl+Z)

### Requirement: Alt+M shortcut is listed in the Help Dialog
The Help Dialog (opened with `?`) SHALL display `Alt+M` as the keyboard shortcut for "Snap to midpoints" in the View section, alongside the other snap/mode toggle shortcuts.

#### Scenario: Help Dialog shows the new shortcut
- **WHEN** the user opens the Help Dialog
- **THEN** the View section lists `Alt+M` next to the label "Snap to midpoints"
