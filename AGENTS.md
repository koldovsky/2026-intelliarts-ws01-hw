# AGENTS.md

## Project Rules and Conventions

This file defines the rules and conventions for AI agents (like Claude or Cursor) working on the Excalidraw project.

### 1. General Principles
- **Maintain Consistency:** Follow the existing coding style (TypeScript, functional React components, hooks).
- **Type Safety:** Always use TypeScript and ensure all interfaces and types are correctly defined.
- **Immutability:** When modifying elements or state, always use immutable updates.
- **Performance:** Be mindful of canvas re-rendering performance. Avoid unnecessary re-renders.

### 2. Coding Standards
- **Imports:** Prefer absolute imports if configured, or maintain consistency with existing relative imports.
- **State Management:** Use `appState` and `elements` as the primary sources of truth.
- **UI Components:** Use existing components from the library when possible.
- **Styling:** Use SCSS and maintain the existing naming conventions.

### 3. Workflow Rules
- **Testing:** Always run existing tests when making changes. Add new tests for new features or bug fixes.
- **Commands:** Use `yarn` if available, otherwise fallback to `npm`/`npx` as documented in `docs/memory/techContext.md`.
- **Modifications:** Do not modify the `packages/` directory unless specifically instructed, as these are core library files.

### 4. Collaboration & Security
- **E2EE:** Never compromise the end-to-end encryption logic.
- **Privacy:** Be careful with local storage and how sensitive data is handled.

### 5. Prohibited Actions
- **No Deletions:** Do not delete existing documentation or configuration files without explicit approval.
- **No Major Refactors:** Avoid large-scale refactorings unless they are the primary goal of the task.
