# Agent Skills Research

Analysis of repeated workflows in this repository and the skills proposed to automate or standardize them.

---

## Skill 1: `add-action`

**Implemented at:** `.claude/skills/add-action/SKILL.md`

### Why this skill is useful

Adding a new Excalidraw action involves exactly **5 co-dependent steps across 4 files**. Omitting any one step causes a silent or hard-to-trace failure:

- The `ActionName` union in `packages/excalidraw/actions/types.ts` must be extended — missing it causes a TypeScript error that only surfaces at typecheck time.
- The action file must be created with `register()` and the correct `captureUpdate` value — the wrong value (`IMMEDIATELY` vs `NEVER` vs `EVENTUALLY`) silently corrupts undo/redo or multiplayer sync with no runtime error.
- The barrel export in `packages/excalidraw/actions/index.ts` must be updated — missing it means the `register()` side-effect never runs, so the action is never registered in `ActionManager` (no error, no effect).
- A test file must follow the exact `render → API.createElement → act → assertElements` pattern.

This is the most templated, highest-frequency workflow in the repository for extending editor behavior.

### What the skill automates

1. Read 7 reference files before writing anything (types, register function, two reference actions, barrel, test pattern, CaptureUpdateAction enum).
2. Add the new name to the `ActionName` union in `types.ts`.
3. Create `packages/excalidraw/actions/actionXxx.ts(x)` using the `register()` pattern with `perform()`, `captureUpdate`, and optional `keyTest` / `PanelComponent`.
4. Export from `packages/excalidraw/actions/index.ts` barrel.
5. Write `packages/excalidraw/actions/actionXxx.test.tsx` using the canonical test pattern.
6. Run verification.

### Files and folders the agent should read

- `packages/excalidraw/actions/types.ts` — `ActionName` union, `Action<TData>` interface, `ActionResult` type
- `packages/excalidraw/actions/register.ts` — `register()` function signature
- `packages/excalidraw/actions/actionToggleGridMode.tsx` — minimal action reference (no PanelComponent)
- `packages/excalidraw/actions/actionDeleteSelected.tsx` — reference for actions with `PanelComponent` and `keyTest`
- `packages/excalidraw/actions/index.ts` — barrel export structure
- `packages/excalidraw/actions/actionDeleteSelected.test.tsx` — canonical test pattern
- `packages/element/src/store.ts` — `CaptureUpdateAction` enum (lines 38–70)

### Verification commands

```bash
yarn test:typecheck   # catches ActionName mismatch and type errors in perform()
yarn test:code        # catches ESLint violations (import order, no direct jotai, etc.)
yarn test:app         # runs the new test plus the regression suite
```

---

## Skill 2: `verify-changes`

**Implemented at:** `.claude/skills/verify-changes/SKILL.md`

### Why this skill is useful

The pre-commit hook is **disabled** — `.husky/pre-commit` contains only a commented-out `# yarn lint-staged`. No automatic quality gate runs on commit. The correct verification command subset depends on which files changed, and running the wrong subset causes real problems:

- Changing `packages/**` without running `yarn build:packages` first causes `yarn test:app` (Vitest) to test against the **stale compiled output** in `packages/*/dist/` — producing a false green that only fails in CI. (The dev server `yarn start` avoids this via TypeScript path aliases, but Vitest does not.)
- Running `yarn test:all` after every minor doc edit is unnecessarily slow.
- Coverage thresholds (lines ≥ 60%, branches ≥ 70%, functions ≥ 63%, statements ≥ 60%) are only enforced by `yarn test:all`, not by `yarn test:app` alone.

### What the skill automates

1. Run `git diff --name-only HEAD` and `git diff --name-only --cached` to detect changed files.
2. Classify files into buckets: `packages/**` source, `excalidraw-app/**` source, root config, docs-only, or generated/lock.
3. Select the minimal correct command sequence from a decision table:
   - Root config changed → `yarn test:all`
   - Any `packages/**` changed → `yarn test:typecheck && yarn test:code && yarn build:packages && yarn test:app`
   - Only `excalidraw-app/**` changed → `yarn test:typecheck && yarn test:code && yarn test:app`
   - Only docs/markdown changed → `yarn test:other`
   - Only generated/lock files → no checks needed
4. Run commands in order, stop on first failure, report which command failed and why.
5. Handle ESLint failures by suggesting `yarn fix:code` and re-checking.
6. Produce a pass/fail summary with the list of commands run.

### Files and folders the agent should read

- `AGENTS.md` — "Development Commands" and "Verification Checklist" sections
- `package.json` (root) — confirms exact script names
- `.husky/pre-commit` — confirms the hook is disabled
- `vitest.config.mts` — coverage threshold values

### Verification commands

This skill is itself the verification step — it runs the checks and reports results. No secondary check is needed.
