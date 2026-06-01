# export-shortcut

## ADDED Requirements

### Requirement: Export scene keyboard shortcut matcher

The editor SHALL provide a matcher `isExportShortcut(event)` that recognizes the
"export scene" keyboard shortcut `Ctrl/Cmd + Shift + E` in a way that is
platform-correct (Cmd on macOS, Ctrl elsewhere) and keyboard-layout-safe
(non-latin layouts).

#### Scenario: Shortcut pressed on the active layout
- **WHEN** a key event has the platform modifier (Cmd/Ctrl) and Shift held and the key resolves to `E`
- **THEN** `isExportShortcut(event)` returns `true`

#### Scenario: Missing Shift modifier
- **WHEN** the platform modifier and `E` are present but Shift is not held
- **THEN** `isExportShortcut(event)` returns `false`

#### Scenario: Missing platform modifier
- **WHEN** Shift and `E` are present but neither Cmd nor Ctrl is held
- **THEN** `isExportShortcut(event)` returns `false`

#### Scenario: Different key
- **WHEN** the modifiers are held but the key is not `E`
- **THEN** `isExportShortcut(event)` returns `false`
