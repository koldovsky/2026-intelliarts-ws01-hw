# export-webp Specification

## Purpose
TBD - created by archiving change export-webp. Update Purpose after archive.
## Requirements
### Requirement: WebP export from image export dialog

The system SHALL provide an "Export to WebP" action in the image export dialog when the canvas contains exportable elements.

#### Scenario: WebP export option is visible

- **WHEN** the user opens the image export dialog and the canvas has at least one exportable element
- **THEN** an "Export to WebP" control is displayed alongside existing PNG and SVG export controls

#### Scenario: Successful WebP download

- **WHEN** the user activates "Export to WebP"
- **THEN** the system initiates download of a WebP image file
- **AND** the image reflects the current export settings (background, padding, scale, and light/dark export mode)

### Requirement: WebP export rejects empty canvas

The system SHALL reject WebP export when the canvas has no exportable elements, consistent with PNG export.

#### Scenario: Empty canvas error

- **WHEN** the user attempts WebP export with zero exportable elements
- **THEN** the system shows the same cannot-export-empty-canvas error as PNG export
- **AND** no file download is started

### Requirement: WebP file format

The exported file SHALL use the WebP image format.

#### Scenario: WebP MIME type

- **WHEN** WebP export completes successfully
- **THEN** the downloaded file uses MIME type `image/webp` and extension `.webp`

