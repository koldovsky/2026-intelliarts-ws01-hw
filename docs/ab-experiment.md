# Task 4 — A/B: WebP export (OpenSpec slice)

Same Task 3 capability: **Export to WebP** from the image export dialog.

| Варіант (інструмент/модель) | Час | Токени | Якість | Переробки | Моменти |
| --------------------------- | --- | ------ | ------ | --------- | ------- |
| **Cursor** (Composer) | ~1–2 min | Not recorded | Good — `en.json`, Vitest, minimal PNG-path extension | None | Restored as final implementation |
| **Claude Code** (Sonnet 4.5) | ~8 min | ~84k (est.) | Issues in `actionExport.tsx` and `ImageExportDialog.tsx` | Replaced by Cursor impl | See errors below |

## Claude issues (why we reverted to Cursor)

- **`actionExport.tsx`:** Added `actionChangeExportWebPQuality` with label key `imageExportDialog.label.webpQuality` **missing from `en.json`**; extra `AppState.exportWebpQuality` not wired like other export actions.
- **`ImageExportDialog.tsx`:** Hardcoded `"Export to WebP"` / `"WebP Quality"` instead of `t(...)`; custom quality slider + `supportsWebP()` gating; diverged from existing export dialog patterns.
- **`utils/webp.ts`:** Parallel WebP helpers unused by the rest of the export stack.
- **No** `exportCanvas.test.ts`; separate OpenSpec change `add-webp-export` (not in final PR).

## Final implementation (Cursor)

- `exportCanvas("webp")` with fixed quality **0.92**, `canvasToBlob` mime support
- WebP button with **`en.json`** keys (`exportToWebp`)
- OpenSpec: `openspec/specs/export-webp/` + archive `2026-06-03-export-webp`
- Tests: `packages/excalidraw/data/exportCanvas.test.ts`

## Conclusion

**Cursor** wins on assignment fit: fewer files, matches codebase conventions, passes typecheck/tests. **Claude** added UX surface quickly but introduced i18n/action inconsistencies that needed rework. Use Cursor (or similar) for brownfield slices with strict patterns; validate Claude output in `actionExport` / dialog files before keeping.
