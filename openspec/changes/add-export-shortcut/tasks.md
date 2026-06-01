# Tasks — export keyboard shortcut

- [x] Add `isExportShortcut(event)` to `packages/common/src/keys.ts`
- [x] Use `matchKey` + `KEYS.CTRL_OR_CMD` for layout/platform safety
- [x] Add colocated unit tests `packages/common/src/keys.test.ts`
  - [x] matches Ctrl/Cmd + Shift + E
  - [x] rejects when Shift missing
  - [x] rejects when Ctrl/Cmd missing
  - [x] rejects other keys
- [ ] (next slice) consume `isExportShortcut` in `actionExport.tsx` `keyTest()`
- [ ] (next slice) add the shortcut hint to the export menu label
