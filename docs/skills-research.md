# Skills Research

This document outlines recurring workflows and potential AI agent skills for the Excalidraw project.

## Identified Workflows

### 1. Adding a New Shape
- **Description:** Adding a new primitive or complex shape to the whiteboard.
- **Steps:**
    - Define the element type in `packages/excalidraw/element/types.ts`.
    - Implement the rendering logic for the new shape.
    - Add the tool to the toolbar.
    - Add event handlers for creating and resizing the shape.
- **Automation Potential:** High. An agent skill could generate the boilerplate for a new element and register it across the necessary files.

### 2. Creating a New Keyboard Shortcut
- **Description:** Mapping a new key combination to an action.
- **Steps:**
    - Define the shortcut in `packages/excalidraw/keys.ts`.
    - Identify or create the action in `packages/excalidraw/actions/**`.
    - Register the action and map it to the shortcut.
- **Automation Potential:** Medium. A skill could ensure that shortcuts don't conflict and are correctly registered in the action system.

### 3. Localization of UI Elements
- **Description:** Adding translations for new UI strings.
- **Steps:**
    - Add the string key and translations to the locale files.
    - Use the translation hook in the component.
- **Automation Potential:** High. An agent could automatically detect untranslated strings and suggest additions to the locale files.

### 4. Component Refactoring
- **Description:** Converting a class component to a functional component or splitting a large component.
- **Steps:**
    - Re-implement logic using hooks.
    - Ensure all props and state are correctly handled.
- **Automation Potential:** High. Standard React refactoring patterns can be automated with agent skills.

## Potential AI Agent Skills

### `add-element-skill`
- **Purpose:** Scaffolds a new drawing element.
- **Inputs:** Element name, icon, properties.
- **Actions:** Updates types, adds rendering logic, updates toolbar.

### `test-generator-skill`
- **Purpose:** Generates Vitest unit tests for a given component or utility.
- **Inputs:** File path.
- **Actions:** Analyzes the file and generates a corresponding `.test.tsx` file with basic coverage.
