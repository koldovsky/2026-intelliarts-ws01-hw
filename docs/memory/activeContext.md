# Active Context

## Current Focus

WS1 homework complete: **WebP image export** shipped on branch `mfranchuk/ws1-homework` (Cursor/OpenSpec implementation).

## Recent Changes

- `EXPORT_IMAGE_TYPES.webp`, `ExportType` `"webp"`, `exportCanvas` WebP branch (quality 0.92)
- `ImageExportDialog` — "Export to WebP" with `en.json` keys
- `packages/excalidraw/data/exportCanvas.test.ts` — MIME / `exportCanvas("webp")` coverage
- OpenSpec archived: `openspec/changes/archive/2026-06-03-export-webp/`; main spec `openspec/specs/export-webp/spec.md`
- Task 4: `docs/ab-experiment.md` (Cursor vs Claude; Cursor implementation kept)
- Task 5: `docs/bmad-comparison.md`, `_bmad-output/` (installer `_bmad/`, `.agents/` gitignored)

## Export Pipeline (image formats)

| Format | Entry | Notes |
|--------|-------|-------|
| PNG | `exportCanvas("png")` | Optional embed-scene metadata |
| SVG | `exportCanvas("svg")` | Vector |
| WebP | `exportCanvas("webp")` | Raster; fixed quality 0.92; no embed-scene metadata |
| Clipboard | `exportCanvas("clipboard")` | PNG to clipboard |

Flow: `ImageExportDialog` → `App.onExportImage` → `exportCanvas` → `exportToCanvas` → `canvasToBlob`.

## Deferred (non-goals)

- WebP clipboard export
- Scene embed metadata in WebP
- Locales beyond `en.json`
