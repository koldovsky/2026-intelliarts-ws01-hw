# Agent Skills Research

## What is a "skill" in this context?

A skill is a reusable, parameterized agent workflow that automates a repeated development task. In Claude Code, skills live in `.claude/skills/` as markdown files with embedded instructions. In Cursor, they are rule files (`.cursor/rules/*.mdc`) marked as `agent-requested`.

## Skill 1 — `run-tests`

### Why it exists

Every code change in this repo should be followed by `yarn test:app --watch=false`, and breaking the coverage thresholds (lines 60%, branches 70%, functions 63%) is a common mistake when adding new code without accompanying tests. This skill removes the friction of remembering the exact command and the right flags.

### What it automates

1. Runs `yarn test:app --watch=false` from repo root
2. If failures exist, surfaces the failing test names and file paths
3. If coverage drops below threshold, highlights which files need more tests
4. Optionally runs `yarn test:typecheck` when TypeScript-heavy files were changed

### When to invoke

After any implementation change, before committing. Can be triggered as a post-edit hook.

---

## Skill 2 — `new-action`

### Why it exists

Adding a keyboard shortcut or toolbar button follows an identical four-step pattern every time: create the action file, register it in `index.ts`, optionally add a key constant to `keys.ts`, and write a test. Without a skill, an agent has to rediscover the pattern from scratch by reading existing actions like `actionDeleteSelected.ts` or `actionDuplicateSelection.ts`.

### What it automates

Given inputs `actionName` (e.g. `selectAll`) and optional `key` (e.g. `KEYS.A` with `ctrlOrCmd`):

1. Scaffolds `packages/excalidraw/actions/action{ActionName}.ts` from the standard template:
   - `register({ name, label, perform, keyTest })`
   - `perform` returns `{ elements, appState, captureUpdate: CaptureUpdateAction.IMMEDIATELY }`
2. Adds the export line to `packages/excalidraw/actions/index.ts`
3. If a new key constant is needed, appends it to `packages/common/src/keys.ts` (`KEYS` and `CODES`)
4. Creates a minimal `action{ActionName}.test.tsx` next to the file
5. Runs `yarn test:app --watch=false` and reports the result

### When to invoke

When implementing a new user-facing action: `@new-action actionName="flipHorizontal" key="KEYS.H" modifier="shiftKey"`

---

## Notes on implementation

Both skills can be implemented as `.claude/skills/run-tests.md` and `.claude/skills/new-action.md` with parameterized prompts. The `new-action` skill benefits from including the full content of `packages/excalidraw/actions/actionDuplicateSelection.ts` as a reference template so the agent does not need to look it up each time.