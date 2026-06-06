## 1. Parser Module

- [x] 1.1 Create `packages/element/src/textCodeBlock.ts` with `parseCodeBlock()` regex function
- [x] 1.2 Export `getRenderableText()` helper that strips fences for measurement

## 2. Measurement Integration

- [x] 2.1 Import `getRenderableText` in the text measurement path (where `element.width`/`element.height` are computed)
- [x] 2.2 Use `getRenderableText()` instead of raw text for width/height calculations

## 3. Render Path

- [x] 3.1 Import `parseCodeBlock` in `packages/element/src/renderElement.ts`
- [x] 3.2 Add code block detection branch: check `parseCodeBlock()` before normal text rendering
- [x] 3.3 Render monospace font (`FONT_FAMILY.Cascadia`), background rect (`#f5f5f5` light / `#1e1e1e` dark), padding (`0.6 * fontSize`), and per-line `fillText`

## 4. Tests

- [x] 4.1 Create `packages/element/src/textCodeBlock.test.ts` with tests for valid detection, missing closing fence, language identifier ignored, and non-matching text
- [x] 4.2 Verify `yarn test:all` passes (8/8 tests pass)
