# selection Specification

## Purpose

Bulk-selection commands for the editor canvas - ways to select many elements at once by a shared property instead of clicking them one by one. The first such command selects every element that shares a type with the current selection.

## Requirements

### Requirement: Select elements of the same type as the current selection

The editor SHALL provide a "Select similar" command that, given a non-empty selection, selects every non-deleted, unlocked element whose `type` matches the `type` of any currently selected element. The command SHALL preserve group selection semantics so that selecting an element that belongs to a group selects the group, consistent with "Select all".

#### Scenario: Select all elements of one type from a single selection

- **WHEN** exactly one rectangle is selected on a canvas that also has other rectangles, ellipses, and arrows
- **THEN** every non-deleted, unlocked rectangle becomes selected
- **AND** no ellipse or arrow becomes selected

#### Scenario: Mixed selection selects the union of the selected types

- **WHEN** one rectangle and one arrow are selected on a canvas that also has more rectangles, arrows, and ellipses
- **THEN** every non-deleted, unlocked rectangle and arrow becomes selected
- **AND** no ellipse becomes selected

#### Scenario: Locked elements are not selected

- **WHEN** one rectangle is selected and another rectangle on the canvas is locked
- **THEN** the locked rectangle is not added to the selection

#### Scenario: Text bound to a container is not selected on its own

- **WHEN** a rectangle with bound text is selected and the user runs the command
- **THEN** the bound text element (the one carrying `containerId`) is not added to the selection as a standalone element

#### Scenario: No selection is a no-op

- **WHEN** nothing is selected and the user runs the command
- **THEN** the selection remains empty and the scene is unchanged

### Requirement: Invoke "Select similar" by keyboard and command palette

The command SHALL be triggerable by the keyboard shortcut Ctrl/Cmd+Shift+A and SHALL be discoverable in the command palette. The shortcut MUST NOT collide with "Select all" (Ctrl/Cmd+A).

#### Scenario: Keyboard shortcut triggers the command

- **WHEN** the user presses Ctrl/Cmd+Shift+A with at least one element selected
- **THEN** the "Select similar" command runs and selects matching-type elements

#### Scenario: Command palette invokes the command

- **WHEN** the user opens the command palette and runs "Select similar" with at least one element selected
- **THEN** the command runs and selects matching-type elements, using the same selection rules as the keyboard shortcut

#### Scenario: Plain Ctrl/Cmd+A still selects all

- **WHEN** the user presses Ctrl/Cmd+A without Shift
- **THEN** "Select all" runs as before and "Select similar" does not
