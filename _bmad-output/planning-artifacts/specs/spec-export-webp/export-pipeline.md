# Export pipeline (brownfield notes)

Flow for raster export:

`ImageExportDialog` → `App.onExportImage` → `exportCanvas` (`packages/excalidraw/data/index.ts`) → `exportToCanvas` → `canvasToBlob` → `fileSave`.

PNG branch uses `canvasToBlob(tempCanvas)` (default PNG). WebP should add `canvasToBlob(tempCanvas, MIME_TYPES.webp, quality)` with fixed quality **0.92** for v1.

Touch points:

- `EXPORT_IMAGE_TYPES` in `packages/common/src/constants.ts`
- `ExportType` in `packages/excalidraw/scene/types.ts`
- `exportCanvas` else-if branch for `webp`
- `canvasToBlob` optional `mimeType` and `quality` args in `packages/excalidraw/data/blob.ts`
- Button in `packages/excalidraw/components/ImageExportDialog.tsx`
- `packages/excalidraw/locales/en.json` — `imageExportDialog` keys
