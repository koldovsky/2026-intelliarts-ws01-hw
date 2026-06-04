---
id: SPEC-export-webp
companions:
  - export-pipeline.md
sources:
  - docs/technical/architecture.md
  - docs/memory/projectbrief.md
---

# Export to WebP from image export dialog

## Why

Users share diagrams as raster images; PNG files are large. WebP is supported by canvas `toBlob` in modern browsers and reduces file size. The image export dialog offers PNG and SVG only — a **pain to solve** for users who want smaller downloads without leaving Excalidraw.

## Capabilities

- id: CAP-1
  intent: User can download the current export selection as a WebP file from the image export dialog.
  success: Given a non-empty canvas, when the user chooses WebP export with current settings (background, padding, scale, dark mode), then a `.webp` file downloads with MIME `image/webp`.

- id: CAP-2
  intent: WebP export fails consistently when nothing is exportable.
  success: Given zero exportable elements, when the user attempts WebP export, then the same empty-canvas error as PNG is shown and no download starts.

## Constraints

- Reuse `exportCanvas` / `exportToCanvas` pipeline; do not add a parallel export path.
- Follow package boundaries (`common` constants, `excalidraw` data + UI).
- English strings in `en.json` only.
- No WebP clipboard or embed-scene metadata in v1.

## Non-goals

- WebP clipboard export.
- Scene JSON embedded in WebP files.
- Changes to `excalidraw-app` product shell.
- Full locale translation beyond `en.json`.

## Success signal

Manual check: draw a shape, open Export image, click WebP, receive a valid `.webp` that opens in an image viewer and reflects export settings.
