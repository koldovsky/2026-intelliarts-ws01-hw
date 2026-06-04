# Task 4 - A/B experiment

Same subtask run twice, two models in the same tool (Claude Code). The subtask is the Task 3 capability slice: implement the `selectSimilar` command (select all elements of the current selection's type) as an action, with wiring and a test.

- Variant A: Claude Code, Opus 4.8 (1M context). The run captured in this repo - the actual `selectSimilar` implementation, archived OpenSpec change, and tests.
- Variant B: Claude Code, Sonnet 4.6. Run in an isolated git worktree built from the pristine base (no Variant A code visible), given the same spec, implementing from scratch.

> Measurement honesty and the asymmetry: Variant B is a clean, isolated, single-task run, so its tokens / time / tool-calls are measured precisely. Variant A's numbers are not cleanly isolatable - the slice was embedded in a larger session that also did the brownfield exploration, the full OpenSpec ceremony, and two detours, so its cells are session-level estimates, not a like-for-like slice measurement. One more asymmetry that matters for "Quality": Variant A had `node_modules` and ran its tests; Variant B's worktree had none, so Sonnet could not run tests at all.

## Comparison

| Варіант (інструмент / модель) | Час | Токени | Якість | Переробки | Моменти |
| --- | --- | --- | --- | --- | --- |
| **A - Claude Code / Opus 4.8** | Session-embedded, not isolatable (rough order ~45-60 min including detours) | Session-level, not isolated (`/cost` for the figure) | Test-verified: 7 scenario tests pass plus the full `packages/excalidraw` suite (807) green; `tsc` + ESLint clean. Mirrored `actionSelectAll`; set `selectedLinearElement: null`; skipped the context menu to avoid `App.tsx` snapshot churn | 2 detours: the `npx openspec` stub, and a `prettier` glob that reformatted pre-existing files (reverted) | Caught the `.claude` `.gitignore` trap; found the openspec npm stub; recorded the mirror-vs-helper decision in `design.md` |
| **B - Claude Code / Sonnet 4.6** | ~6.2 min (371s), measured, slice only | 62.9k output tokens, measured (isolated worktree) | Implementation correct and idiomatic - a faithful `actionSelectAll` clone (it even kept the single-linear-element handling that A dropped). **But the test calls `API.getElements()`, which does not exist (5 type errors) - it would not compile.** Not caught, because the worktree had no `node_modules` to run tests. Also an unused `React` import | Single pass, 70 tool calls; no test-feedback loop was available to it | Found every required wiring site **and** added a context-menu + `HelpDialog` entry (more discoverable than A, but more `App.tsx` surface); keyTest `event.key === "A"` relies on the browser upper-casing Shift+A (works; A's `.toLowerCase()` is a touch more defensive) |

## What Variant B actually did

- **Wiring:** found all of them unprompted - the `ActionName` union, the barrel `index.ts` re-export, `shortcuts.ts`, the `en.json` label - and went further, wiring the context menu and the help dialog. More complete than A on discoverability, at the cost of touching `App.tsx` (snapshot risk A deliberately avoided).
- **Approach:** same low-risk choice - clone `actionSelectAll`. No attempt to over-generalize. Its clone was actually more faithful (kept the `selectedLinearElement` branch).
- **keyTest:** handled the Shift/casing correctly with `event.key === "A"`; the shortcut fires and does not collide with Select all. Slightly less defensive than A's lower-casing, but correct for real browser events.
- **Verification loop:** none available. The single defect (`API.getElements()` in the test) is exactly the kind of slip a test run catches in seconds - and A, which could run tests, caught/avoided its equivalents.

## Conclusion - which model for what

Both models picked the right pattern and got the core logic right; raw capability was not the differentiator on this slice. Sonnet was markedly cheaper and faster on the isolated task (62.9k tokens, ~6 min) and was actually more thorough on wiring. Its one real defect was a hallucinated test API (`API.getElements()`) that a runnable test loop would have caught immediately.

So: for a well-patterned, mechanical slice like this - clone an existing action, wire it, test it - the lighter model (Sonnet) is the better value, **provided it runs in an environment where it can execute its own tests** and close the loop. Reserve the heavier model (Opus) for the ambiguous, exploratory work where it actually earned its cost here: the brownfield archaeology and the `.gitignore` / openspec-package traps in Tasks 1 and 3, not the mechanical implementation.

Caveat: this was not perfectly apples-to-apples - A could run tests and B could not, so part of B's quality gap is an artifact of the isolated worktree rather than the model. In a normal checkout, Sonnet would very likely have caught the test bug itself.
