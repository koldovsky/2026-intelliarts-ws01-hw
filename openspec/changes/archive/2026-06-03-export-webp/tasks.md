# export-webp tasks

## 1. Types and constants

- [x] 1.1 Add `webp` to `EXPORT_IMAGE_TYPES` in `packages/common/src/constants.ts`
- [x] 1.2 Extend `ExportType` in `packages/excalidraw/scene/types.ts` with `"webp"`

## 2. Export pipeline

- [x] 2.1 Add `webp` branch in `exportCanvas` (`packages/excalidraw/data/index.ts`) mirroring PNG without embed metadata
- [x] 2.2 Ensure `App.onExportImage` accepts the new `EXPORT_IMAGE_TYPES.webp` key

## 3. UI and i18n

- [x] 3.1 Add "Export to WebP" button in `ImageExportDialog.tsx`
- [x] 3.2 Add `imageExportDialog` strings in `packages/excalidraw/locales/en.json`

## 4. Tests and verification

- [x] 4.1 Add or extend Vitest test for WebP export MIME type / `exportCanvas("webp")`
- [x] 4.2 Run `yarn test:typecheck` and `yarn test:app --watch=false`
- [x] 4.3 Run `openspec validate export-webp --strict`

## 5. Documentation

- [x] 5.1 Update `docs/memory/activeContext.md` and `docs/memory/progress.md` with export-webp capability
