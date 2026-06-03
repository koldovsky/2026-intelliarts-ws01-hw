# Active Context — Excalidraw Monorepo

## Current Focus

The `fenced-code-blocks-in-text` OpenSpec change is **completed and archived**. All 9 tasks are done, `openspec validate --strict` passes, and the change is archived at `openspec/changes/archive/2026-06-03-fenced-code-blocks-in-text/`.

## What Was Built

| Component | Files |
| --- | --- |
| Parser module | `packages/element/src/textCodeBlock.ts` — `parseCodeBlock()` regex + `getRenderableText()` helper |
| Measurement integration | `packages/element/src/textMeasurements.ts` — code-block-aware width/height via monospace font |
| Canvas rendering | `packages/element/src/renderElement.ts` — monospace font (`FONT_FAMILY.Cascadia`), background rect (`#f5f5f5` light / `#1e1e1e` dark), padding (`0.6 * fontSize`), per-line `fillText` |
| Tests | `packages/element/src/textCodeBlock.test.ts` — 8 tests (valid detection, language identifier, missing fence, multi-line, non-matching) |

## Key Architecture Decisions

- **No new element type** — reuses `ExcalidrawTextElement`, no schema changes, full backward compatibility
- **Regex-based detection** — `/^```(?:\w+)?\n([\s\S]*?)\n```$/` keeps the parser simple and dependency-free
- **Inline render branch** — code block detection runs first in the existing `drawElementOnCanvas` default case; falls through to normal text if no match
- **No WYSIWYG changes** — editor shows raw backticks; styled rendering appears on exit
- **No syntax highlighting** — explicitly out of scope for MVP

## Experiments Completed

- **Task 4 (A/B):** Run A (big-pickle) vs Run B (gpt-5.4) compared in `docs/a-experiment.md`, `docs/b-experiment.md`, `docs/ab-experiment.md`. Both produced correct 8-test implementations in 2–3 min with 0 reworks.
- **Task 5 (BMAD Quick Flow):** Theoretical comparison documented in `docs/bmad-comparison.md`. Conclusion: linear approach optimal for small isolated tasks; BMAD Quick Flow adds value when scope is unclear or multiple agents needed.

## Verification Status

| Check                        | Status                                      |
| ---------------------------- | ------------------------------------------- |
| Tests (8/8)                  | ✅ All pass                                 |
| Full test suite              | ✅ All pass (10 pre-existing sidebar failures unrelated) |
| Visual verification          | ✅ User confirmed code block styling visible |
| `openspec validate --strict` | ✅ Passes                                   |

## Nearby Files & Patterns

- `packages/element/src/textCodeBlock.ts` exports `parseCodeBlock(text)` and `getRenderableText(text)`
- `packages/element/src/renderElement.ts` imports `parseCodeBlock` and adds code block branch before normal text rendering
- `packages/element/src/textMeasurements.ts` imports `parseCodeBlock` and `getRenderableText` for code-block-aware measurement
