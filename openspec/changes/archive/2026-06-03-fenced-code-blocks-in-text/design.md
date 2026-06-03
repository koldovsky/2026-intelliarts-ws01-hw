## Context

Excalidraw renders text elements via `renderElement.ts` using `fillText` with a proportional font. Text measurement uses `measureText` to compute `element.width`/`element.height`. The WYSIWYG editor (`textWysiwyg.ts`) operates on `element.originalText` and is decoupled from rendering. Fenced code blocks (triple backticks) are a Markdown convention — the implementation should detect them at render/measurement time without altering the WYSIWYG or storage layer.

## Goals / Non-Goals

**Goals:**
- Detect fenced code blocks (` ``` ... ``` `) in `ExcalidrawTextElement.originalText`
- Render code blocks with a monospace font and tinted background rectangle
- Measure code block width/height excluding fence lines, using monospace metrics
- Full backward compatibility with existing `.excalidraw` files

**Non-Goals:**
- No new element type (`ExcalidrawElement` schema unchanged)
- No syntax highlighting or language detection
- No changes to WYSIWYG editing experience
- No Markdown rendering beyond fenced code blocks (no lists, links, bold, etc.)

## Decisions

1. **Detection via regex** — Use `/^```(?:\w+)?\n([\s\S]*?)\n```$/` in `textCodeBlock.ts`. Language identifier (e.g., ` ```ts `) is accepted but ignored — only the code content is extracted. This keeps the parser simple and avoids grammar dependencies.

2. **Rendering in existing render path** — Add a conditional branch in `renderElement.ts` that checks `parseCodeBlock()`. If it returns a match, render with monospace font, background rect, and per-line `fillText`. Otherwise fall through to the normal text rendering. This avoids a new renderer and keeps the code path localized.

3. **Measurement via `getRenderableText()`** — A new helper `getRenderableText(text)` returns either the code content (if a code block is detected) or the original text. Use this in `measureText` calls so element dimensions ignore the backtick fences and calculate based on actual rendered content.

4. **Background styling** — Light gray (`#f5f5f5`) for light theme, dark gray (`#1e1e1e`) for dark theme. Padding of `0.6 * fontSize`. This matches common code block aesthetics without introducing theme-configurable colors.

5. **No WYSIWYG changes** — The editor works on `originalText` and shows raw backticks. When the user exits editing, the element re-renders with the code block style. Live preview during typing is not needed for MVP.

## Risks / Trade-offs

- **Regex brittleness** — The parser only matches exact fence format. Minor whitespace variations may fail to detect a code block. Mitigation: keep the regex strict for MVP; extend later if needed.
- **No syntax highlighting** — Users familiar with rich code blocks may find this underwhelming. Explicitly documented as a non-goal; can be layered on later without breaking changes.
- **No language label rendering** — The language tag is silently ignored. Could be displayed in a future iteration.
- **WYSIWYG shows raw backticks** — Users editing a code block see fences in the editor. Acceptable trade-off for MVP — a future custom WYSIWYG could strip them.
