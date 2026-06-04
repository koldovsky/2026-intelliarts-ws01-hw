# Active Context

## Current Focus

WebP image export is implemented and validated via OpenSpec change `export-webp`.

## Recent Changes

- Added `EXPORT_IMAGE_TYPES.webp` and `ExportType` `"webp"`
- `exportCanvas` WebP branch uses `canvasToBlob` with `image/webp` at quality 0.92
- Image export dialog includes "Export to WebP" (`en.json` strings)
- Tests: `packages/excalidraw/data/exportCanvas.test.ts`

## Export Pipeline (image formats)

| Format | Entry | Notes |
|--------|-------|-------|
| PNG | `exportCanvas("png")` | Optional embed-scene metadata |
| SVG | `exportCanvas("svg")` | Vector |
| WebP | `exportCanvas("webp")` | Raster; no embed-scene metadata |
| Clipboard | `exportCanvas("clipboard")` | PNG to clipboard |

Flow: `ImageExportDialog` → `App.onExportImage` → `exportCanvas` → `exportToCanvas` → `canvasToBlob`.

## Next Steps

- Archive OpenSpec change `export-webp` after merge if not already archived locally
- Consider non-English locale strings if product requires full i18n
