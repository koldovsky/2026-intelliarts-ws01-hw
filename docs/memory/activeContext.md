# Active context

> Memory Bank file. What is being worked on right now and the decisions in flight.

## Current focus

Intelliarts WS1 homework on the Excalidraw snapshot. Working through the five tasks in [walkthrough.md](../walkthrough.md) one by one.

## Recent changes

- Task 1: context-limit rules (`.claude/settings.json` deny), Memory Bank ([projectbrief](projectbrief.md), [techContext](techContext.md), [systemPatterns](systemPatterns.md)), and the reconstructed [architecture doc](../technical/architecture.md). Also un-ignored `.claude/settings.json` in `.gitignore` so the deny rules reach the PR.
- Task 2: [AGENTS.md](../../AGENTS.md) project rules and [skills-research.md](../skills-research.md).
- Task 3: shipped the `selectSimilar` capability slice through the full OpenSpec cycle (proposal -> design -> spec -> tasks -> implement -> test -> validate --strict -> archive). The change is archived at `openspec/changes/archive/2026-06-04-add-select-similar/` and the `selection` capability now lives in `openspec/specs/selection/spec.md`.

## The selectSimilar slice

- New action `actionSelectSimilar` (`packages/excalidraw/actions/actionSelectSimilar.ts`) selects every non-deleted, unlocked element whose type matches the current selection. Mirrors `actionSelectAll`.
- Bound to Ctrl/Cmd+Shift+A and registered in the shortcut map with a `labels.selectSimilar` label. The spec also calls for command-palette discoverability; this slice ships the keyboard path and leaves the palette wiring (adding the action to the palette's curated list in `CommandPalette.tsx`) as the next step.
- Covered by `actionSelectSimilar.test.tsx` (7 scenarios, including the keyboard path Ctrl/Cmd+Shift+A and the no-collision-with-Select-all case). Verified 2026-06-05: `yarn test:app --watch=false packages/excalidraw/actions/actionSelectSimilar.test.tsx` -> 7/7 passed, and `yarn test:typecheck` -> clean. The full `packages/excalidraw` suite (807 tests) runs green via `yarn test:all`.

## Active decisions

- Mirror `actionSelectAll` rather than extract a shared helper - keeps the diff additive and avoids touching a stable file. See the change's `design.md`.
- Type-only matching for now; "same style" selection is explicitly out of scope.
- No context-menu entry, to avoid snapshot churn in `App.tsx`.

## Next steps

- Task 4: done. Variant B was run via an isolated Sonnet 4.6 sub-agent (62.9k tokens, ~6 min); both variants and the conclusion are filled in `docs/ab-experiment.md`.
- Task 5 (bonus): skipped by choice (BMAD not installed here).
- At submission: decide what to commit (the openspec `init` also added `.github/skills/` and `.github/prompts/` tooling files that are not part of the homework).

## Open items / notes

- The walkthrough's `npx openspec@latest init` is stale: the npm `openspec` package is a `0.0.0` stub. The working CLI is `@fission-ai/openspec`, installed globally and also available as the `openspec-*` / `opsx:*` Claude Code skills. Worth flagging to the workshop author.
