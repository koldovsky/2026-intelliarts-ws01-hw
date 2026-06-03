# fenced-code-blocks Specification

## Purpose
Code blocks are a common convention from Markdown that users expect to work in Excalidraw text elements. This spec defines the requirements for detecting triple-backtick fences in `ExcalidrawTextElement` content, rendering them with monospace styling and background, and correctly measuring element dimensions excluding fence lines.
## Requirements
### Requirement: Fenced code block detection

The system SHALL detect fenced code blocks in `ExcalidrawTextElement` text content by matching the pattern: opening triple backticks (optionally followed by a language identifier), one or more lines of code content, closing triple backticks. Non-matching text SHALL be rendered as normal text without code block styling.

#### Scenario: Valid fenced code block is detected
- **WHEN** a text element contains text matching `^```(?:\w+)?\n([\s\S]*?)\n```$`
- **THEN** the parser returns the extracted code content without the fence lines

#### Scenario: Missing closing fence is not detected as code block
- **WHEN** a text element contains opening triple backticks but no matching closing triple backticks
- **THEN** the parser returns null and the element renders as normal text

#### Scenario: Language identifier is accepted but ignored
- **WHEN** a text element contains ` ```ts\nconst x = 1;\n``` `
- **THEN** the parser extracts `const x = 1;` as the code content, discarding the `ts` language identifier

### Requirement: Code block rendering

When a fenced code block is detected, the element SHALL render with a monospace font, a tinted rectangular background, and each code line drawn as a separate `fillText` call.

#### Scenario: Code block renders with monospace font
- **WHEN** a text element contains a valid fenced code block
- **THEN** the element is rendered using a monospace font (`fontFamily = FONT_FAMILY.Cascadia`)

#### Scenario: Code block renders with background rect
- **WHEN** a text element contains a valid fenced code block
- **THEN** a filled rectangle is drawn behind the code lines using `#f5f5f5` in light theme and `#1e1e1e` in dark theme

#### Scenario: Code block is padded
- **WHEN** a text element contains a valid fenced code block
- **THEN** the code lines are offset from the element bounds by a padding of `0.6 * fontSize`

### Requirement: Code block measurement

The element dimensions (width, height) SHALL be calculated using only the rendered code content, excluding the fence lines. Monospace font metrics SHALL be used for width calculation.

#### Scenario: Width excludes fence lines
- **WHEN** computing element width for a fenced code block
- **THEN** the width is calculated from the longest line of code content, not including the fence lines

#### Scenario: Height excludes fence lines
- **WHEN** computing element height for a fenced code block
- **THEN** the height accounts only for code content lines, not the fence lines

