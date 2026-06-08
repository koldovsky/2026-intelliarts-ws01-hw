# Export WebP proposal

## Why

Users can export drawings as PNG or SVG from the image export dialog. WebP provides smaller file sizes for sharing diagrams online while preserving visual quality. The codebase already supports WebP at the canvas blob layer (`IMAGE_MIME_TYPES.webp`, `exportToBlob`), but the product export UI does not expose it.

## What Changes

- Add **Export to WebP** button in the image export dialog (alongside PNG and SVG)
- Extend `EXPORT_IMAGE_TYPES` and `exportCanvas` to handle `webp` downloads
- Add English UI strings for the new export option
- Add a Vitest test covering WebP export MIME type

## Capabilities

### New Capabilities

- `export-webp`: Raster export of the canvas to a downloadable WebP file from the image export dialog, honoring existing export settings (background, padding, scale, dark mode)

### Modified Capabilities

<!-- None — no existing openspec/specs baseline in this repo -->

## Impact

- `packages/common/src/constants.ts` — `EXPORT_IMAGE_TYPES`
- `packages/excalidraw/scene/types.ts` — `ExportType`
- `packages/excalidraw/data/index.ts` — `exportCanvas`
- `packages/excalidraw/components/ImageExportDialog.tsx` — UI button
- `packages/excalidraw/locales/en.json` — labels
- `packages/excalidraw/tests/` — export test

No changes to `packages/element` or `excalidraw-app`. No new dependencies.
