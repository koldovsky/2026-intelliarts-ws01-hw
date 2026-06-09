---
title: "Select Same Type (Alt+T)"
type: feature
created: 2026-06-09
status: done
route: one-shot
---

# Select Same Type (Alt+T)

## Intent

**Problem:** Excalidraw had no way to bulk-select elements by type. Users wanting to restyle all rectangles had to click each one individually.

**Approach:** Register a new action `selectSameType` bound to Alt+T. When elements are selected, expand the selection to all non-deleted, non-locked, non-bound-text elements of the same type(s). No-op when nothing is selected or when a linear element is being edited.

## Suggested Review Order

1. [Action implementation](../../packages/excalidraw/actions/actionSelectAll.ts) — core `perform` and `keyTest` logic
2. [Types](../../packages/excalidraw/actions/types.ts) — `ActionName` union addition
3. [Shortcuts](../../packages/excalidraw/actions/shortcuts.ts) — `ShortcutName` + `shortcutMap` entry
4. [Barrel export](../../packages/excalidraw/actions/index.ts) — re-export
5. [App import](../../packages/excalidraw/components/App.tsx) — registration side-effect import
6. [i18n](../../packages/excalidraw/locales/en.json) — `labels.selectSameType` key
7. [HelpDialog](../../packages/excalidraw/components/HelpDialog.tsx) — discoverability entry
8. [Tests](../../packages/excalidraw/actions/actionSelectSameType.test.tsx) — 7 cases
