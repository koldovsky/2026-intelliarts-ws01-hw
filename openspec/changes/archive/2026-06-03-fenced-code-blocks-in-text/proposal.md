## Why

Users want to embed code snippets in Excalidraw diagrams. Issue #11340 requests support for fenced code blocks created via triple backticks (```). This is a common convention from Markdown that users naturally expect to work in text elements. Implementing this improves Excalidraw's utility for technical diagramming without introducing a complex rich-text engine.

## What Changes

- `ExcalidrawTextElement` gains the ability to detect fenced code blocks in its text content
- Code blocks render with a monospace font and styled background rectangle
- Text measurement accounts for code block layout (no backticks in width/height calc)
- WYSIWYG editing remains unchanged — user edits raw backtick-marked text
- No new element type — uses existing `ExcalidrawTextElement`
- No changes to `.excalidraw` schema — full backward compatibility

## Capabilities

### New Capabilities
- `fenced-code-blocks`: Detect triple-backtick fences in text elements and render them as code blocks with monospace styling and background

### Modified Capabilities

*(none — existing text element rendering behavior is extended, not modified)*

## Impact

- **`@excalidraw/element`**: New `textCodeBlock.ts` parser module; modified measurement logic; new rendering branch in render path
- **`:excalidraw`** (app-level): No changes — feature is fully in shared packages
- **Schema**: Unchanged — existing `.excalidraw` files remain compatible
- **WYSIWYG**: Unchanged — editor shows raw backtick text
