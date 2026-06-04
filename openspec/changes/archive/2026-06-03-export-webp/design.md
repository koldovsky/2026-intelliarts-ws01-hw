## Context

Image export flows through `App.onExportImage` → `exportCanvas` in `packages/excalidraw/data/index.ts`. PNG uses `exportToCanvas` then `canvasToBlob`. SVG uses `exportToSvg`. `packages/utils/src/export.ts` already implements `exportToBlob` with configurable `mimeType`, including `image/webp` with quality default 0.8.

The image export modal (`ImageExportDialog.tsx`) only offers PNG, SVG, and clipboard PNG via `EXPORT_IMAGE_TYPES` from `@excalidraw/common`.

## Goals / Non-Goals

**Goals:**

- Add WebP as a first-class download option in the image export dialog
- Reuse the same export settings as PNG (background, padding, scale, exportWithDarkMode)
- Match PNG empty-canvas error handling
- Ship with test coverage and `en.json` strings only

**Non-Goals:**

- WebP clipboard export
- Embedding Excalidraw scene JSON in WebP (PNG-only `exportEmbedScene` metadata)
- Changes to `excalidraw-app` product shell
- Translating non-English locale files
- PDF or other formats

## Decisions

### 1. Extend `EXPORT_IMAGE_TYPES` with `webp`

Add `webp: "webp"` in `packages/common/src/constants.ts` and extend `ExportType` in `packages/excalidraw/scene/types.ts`. Keeps `App.onExportImage` type-safe.

**Alternative:** String literal union only in excalidraw — rejected; constants are shared with UI.

### 2. Implement WebP in `exportCanvas` parallel to PNG

Add `else if (type === "webp")` after the PNG branch:

- `canvasToBlob(tempCanvas, MIME_TYPES.webp, 0.92)` (or use shared helper)
- `fileSave` with extension `webp`, mime `IMAGE_MIME_TYPES.webp`
- Do not apply `encodePngMetadata` / `exportEmbedScene` (PNG-specific)

**Alternative:** Route through `exportToBlob` from utils — viable but `exportCanvas` already uses inline `canvasToBlob` for PNG; stay consistent.

### 3. UI placement in `ImageExportDialog`

Add a `FilledButton` after "Export to SVG", same pattern as PNG/SVG buttons, calling `onExportImage(EXPORT_IMAGE_TYPES.webp, ...)`.

### 4. Browser support

`HTMLCanvasElement.toBlob("image/webp")` is supported in Chromium, Firefox, and Safari. If `toBlob` returns null, existing error paths / console handling apply; no separate feature detection in v1.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| WebP unsupported in old browser | Rare; same failure mode as failed PNG blob |
| Larger diff in `exportCanvas` switch | Single branch, mirrors PNG |
| `exportEmbedScene` users expect WebP metadata | Document non-goal; WebP ignores embed flag |

## Migration Plan

Not applicable — additive UI and export path. No data migration.

## Open Questions

None for v1.
