---
title: 'Export to WebP'
type: 'feature'
created: '2026-06-04'
status: 'done'
baseline_commit: '39c84f5'
context:
  - '{project-root}/docs/memory/systemPatterns.md'
  - '{project-root}/_bmad-output/planning-artifacts/specs/spec-export-webp/SPEC.md'
  - '{project-root}/_bmad-output/planning-artifacts/specs/spec-export-webp/export-pipeline.md'
route: 'quick-dev'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The image export dialog has no WebP download option; users who need smaller raster files must use PNG only.

**Approach:** Extend the existing PNG raster path with a `webp` export type, `canvasToBlob` WebP MIME/quality, dialog button, and `en.json` labels — same settings as PNG, no embed metadata.

## Boundaries & Constraints

**Always:** Mirror PNG empty-canvas handling; use `EXPORT_IMAGE_TYPES` and action/export patterns; add Vitest for WebP MIME in `exportCanvas`.

**Ask First:** None for v1.

**Never:** WebP clipboard; embed scene in WebP; quality slider UI; `excalidraw-app` changes.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | Canvas with elements, WebP export | `.webp` download, `image/webp` | N/A |
| EMPTY_CANVAS | No exportable elements | Same alert as PNG | `cannotExportEmptyCanvas` |
| LARGE_CANVAS | Huge scene | Blob failure | `CANVAS_POSSIBLY_TOO_BIG` via existing blob helper |

</frozen-after-approval>

## Code Map

- `packages/common/src/constants.ts` — add `webp` to `EXPORT_IMAGE_TYPES`
- `packages/excalidraw/scene/types.ts` — `ExportType` includes `"webp"`
- `packages/excalidraw/data/blob.ts` — `canvasToBlob` accepts mime + quality
- `packages/excalidraw/data/index.ts` — `exportCanvas` webp branch
- `packages/excalidraw/components/ImageExportDialog.tsx` — WebP button
- `packages/excalidraw/locales/en.json` — labels
- `packages/excalidraw/data/exportCanvas.test.ts` — WebP MIME test

## Tasks & Acceptance

**Execution:**
- [x] `packages/common/src/constants.ts` — add `webp` to `EXPORT_IMAGE_TYPES` — type-safe export key
- [x] `packages/excalidraw/scene/types.ts` — extend `ExportType` — compile-time routing
- [x] `packages/excalidraw/data/blob.ts` — optional mime/quality on `canvasToBlob` — WebP encoding
- [x] `packages/excalidraw/data/index.ts` — `webp` branch in `exportCanvas` — download path
- [x] `packages/excalidraw/components/ImageExportDialog.tsx` — WebP `FilledButton` — user entry
- [x] `packages/excalidraw/locales/en.json` — `exportToWebp` strings — i18n
- [x] `packages/excalidraw/data/exportCanvas.test.ts` — Vitest WebP MIME — regression guard

**Acceptance Criteria:**
- Given elements on canvas, when WebP export runs, then `fileSave` receives blob with `image/webp` and extension `webp`.
- Given empty canvas, when WebP export runs, then export throws empty-canvas error.

## Verification

- `yarn test:typecheck`
- `yarn test packages/excalidraw/data/exportCanvas.test.ts --watch=false`
