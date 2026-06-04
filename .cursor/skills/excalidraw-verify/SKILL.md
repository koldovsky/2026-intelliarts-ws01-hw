---
name: excalidraw-verify
description: >-
  Runs Excalidraw monorepo verification gates (typecheck, Vitest, ESLint, OpenSpec).
  Use when the user asks to verify, run tests, check before commit/PR, or before
  marking implementation complete in this repository.
---

# Excalidraw Verify

Run the correct verification commands for this Yarn workspaces monorepo. Read [AGENTS.md](../../../AGENTS.md) for project rules.

**Do not** claim work is complete until all applicable steps pass.

## When to Use

- User says: verify, run tests, ready for PR, check before commit, is it done?
- After implementing a feature (especially after **excalidraw-feature**)
- Before creating a git commit for code changes

## Prerequisites

- Commands run from **repository root** (where root `package.json` lives)
- Dependencies installed (`yarn install` if `node_modules` missing)

## Step 1 — Identify What Changed

From `git diff --name-only` (staged + unstaged) or the user's stated paths, note:

| Path prefix | Package touched |
|-------------|-----------------|
| `packages/element/` | `@excalidraw/element` |
| `packages/excalidraw/` | `@excalidraw/excalidraw` |
| `packages/common/` | `@excalidraw/common` |
| `packages/math/` | `@excalidraw/math` |
| `excalidraw-app/` | `excalidraw-app` |
| `openspec/` | OpenSpec artifacts |

Docs-only changes (`docs/**`, `AGENTS.md`): skip Vitest unless tests were also changed.

## Step 2 — Always Run Typecheck

```bash
yarn test:typecheck
```

Must exit 0. On failure, report TypeScript errors with file paths; fix before continuing.

## Step 3 — Run Tests

**Default (code or test files changed):**

```bash
yarn test:app --watch=false
```

(`yarn test` aliases to `vitest`; use `--watch=false` for CI-style single run.)

**Focused run** (single package or file):

```bash
yarn test:app --watch=false packages/excalidraw/tests/tool.test.tsx
```

Pick a test file adjacent to the change when possible.

## Step 4 — ESLint (When Source Changed)

If any non-test `.ts`, `.tsx`, `.js` file was modified (outside `docs/`):

```bash
yarn test:code
```

Skip if only Markdown or `docs/**` changed.

## Step 5 — Full Gate (Before PR / Large Change)

When the user asks for full verification or many packages changed:

```bash
yarn test:all
```

Runs: typecheck + eslint + prettier check + vitest.

## Step 6 — OpenSpec (When Applicable)

If `openspec/changes/**` exists and was touched in this work:

```bash
openspec validate --strict
```

Requires OpenSpec CLI installed. On failure, report validation errors; do not archive the change yet.

## Step 7 — Report Results

Output a short summary:

```
## Verification
- [x] yarn test:typecheck — pass
- [x] yarn test — pass (N tests)
- [x] yarn test:code — pass / skipped (docs only)
- [ ] openspec validate — fail: <reason>
```

On any failure:

1. Paste relevant error lines (file + message)
2. Do **not** say the task is complete
3. Propose minimal fixes

## Anti-Patterns

- Claiming "done" without running commands when `.ts`/`.tsx` changed
- Running only `yarn test` after doc-only edits and ignoring typecheck on code PRs
- Updating `**/__snapshots__/**` unless tests intentionally changed behavior (`yarn test:update` only when justified)
- Committing with red `yarn test:typecheck`

## Done When

- All applicable steps above exit 0
- User receives explicit pass/fail summary with commands run
