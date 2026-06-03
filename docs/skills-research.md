# Skills Research — Excalidraw Monorepo

## Recurring Workflows Identified

After exploring the codebase — package structure, test conventions, action
patterns, CI pipelines, and lint/format tooling — two workflows stand out as
high-value candidates for automation.

---

## Skill 1 — Full CI Check (`run-ci`)

### What it's for

Before pushing a branch, developers need to pass the same checks that run in
GitHub Actions (`.github/workflows/test.yml`, `lint.yml`). Manually chaining
the four commands is error-prone and easy to forget.

### What it automates

Runs the full local CI suite in the correct order:

1. `yarn test:typecheck` — `tsc` full type check across all workspace packages.
2. `yarn test:code` — ESLint with zero-warning tolerance.
3. `yarn test:other` — Prettier format check.
4. `yarn test:app --watch=false` — Vitest test suite (jsdom + canvas mock).

Equivalent to `yarn test:all` but surfaces which step failed rather than
stopping silently at the first error.

### Why it's useful here

The monorepo has six packages with cross-package type aliases resolved only at
test time (see `vitest.config.mts`). A type error in `packages/element` can
silently pass ESLint but fail `tsc`. Running all four steps — and seeing which
one failed — saves a round-trip to CI.

---

## Skill 2 — New Action Scaffold (`new-action`)

### What it's for

New canvas actions (align, flip, delete, duplicate…) all follow the same
structural pattern in `packages/excalidraw/actions/`. Manually wiring a new
action involves four repeatable steps that are easy to get wrong.

### What it automates

Given an action name (e.g. `Rotate`), the skill:

1. Creates `packages/excalidraw/actions/action<Name>.ts` from the standard
   template:
   - Named import from `register` (`./register`).
   - `perform(elements, appState, formData, app)` returning
     `{ elements, appState, commitToHistory }` — never mutating state directly.
   - Exports the action as a named constant.
2. Adds the export line to `packages/excalidraw/actions/index.ts`.
3. Creates a matching test stub in `packages/excalidraw/tests/action<Name>.test.tsx`
   using `renderApp` + `UI` from `test-utils.ts`.
4. Reminds the developer to add a `keyBinding` and `contextItemLabel` if the
   action should appear in the context menu or toolbar.

### Why it's useful here

The `register()` + `perform()` contract (defined in
`packages/excalidraw/actions/register.ts` and `types.ts`) must be followed
exactly — wrong return shape silently drops history entries. Scaffolding removes
the opportunity for that class of bug and keeps new actions consistent with the
~30 existing ones.