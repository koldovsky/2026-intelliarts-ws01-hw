# Progress

> Memory Bank file. What works, what is left, and the current state of the WS1 homework.

## Status by task

| Task | What | State |
| --- | --- | --- |
| 1 | Context limit + Memory Bank + architecture doc | Done |
| 2 | AGENTS.md rules + skills research | Done |
| 3 | `selectSimilar` capability via OpenSpec | Done |
| 4 | A/B experiment writeup | Done (both variants filled + conclusion) |
| 5 | BMAD Quick Flow comparison (bonus) | Skipped (optional, by choice) |

## What works

- The `selectSimilar` command runs through the normal action path: keyboard (Ctrl/Cmd+Shift+A) and command palette. It selects all non-deleted, unlocked elements of the selected type(s), excludes locked elements and container-bound text, and is a no-op with an empty selection.
- Verification is green: `actionSelectSimilar.test.tsx` (7 tests, including the Ctrl/Cmd+Shift+A keyboard path and no-collision with Select all), the full `packages/excalidraw` suite (807 passed / 11 skipped), `yarn test:typecheck`, and ESLint on the changed files.
- OpenSpec: `openspec validate add-select-similar --strict` passed before archive; the change is archived and the `selection` spec is promoted.

## What is left

- Submission housekeeping: branch, commit, push, open the PR for CodeRabbit.

Task 5 (BMAD Quick Flow) is skipped by choice - it is an optional bonus and the BMAD framework is not installed in this repo.

## Known issues / risks

- `yarn test:other` (Prettier check) reports pre-existing files that were never Prettier-clean in this snapshot (`docs/walkthrough.md`) plus tool-generated `.github/skills/` and `.github/prompts/` files from the openspec install. These are not from the homework work; the pre-commit hook formats only staged files.
- The openspec `init` added `.github/skills/`, `.github/prompts/`, and the `openspec/` tree. Decide which of these belong in the submission PR.
- Full `yarn test:all` has not been run end to end (the suite is large); changed areas were tested directly instead.
