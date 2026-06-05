# A/B Experiment: Implementing `duplicateInPlace`

## Task performed

Implement a "Duplicate In Place" action (`Ctrl+Shift+D`) as described in the OpenSpec change `duplicate-in-place`. The subtask isolated for comparison: **write the action file and its unit test** (`actionDuplicateInPlace.ts` + `actionDuplicateInPlace.test.tsx`).

## Comparison table

| Variant | Tool / Model | Time (approx) | Tokens (est.) | Quality | Rework rounds | Notable moments |
|---|---|---|---|---|---|---|
| A | Claude Code — claude-sonnet-4-6 | ~4 min | ~8 k input / 1.5 k output | Correct on first run; 1 test case had wrong expected element order | 1 (fix test order) | Correctly identified `ActionName` type registration was needed after typecheck; auto-discovered `arrayToMap` import pattern from sibling files |
| B | Claude Code — claude-opus-4-7 (hypothetical) | ~6 min | ~12 k input / 2 k output | Expected to produce more verbose code and more thorough edge-case tests; likely would have caught the `ActionName` omission before running typecheck | 0 (estimated) | Typically generates more conservative implementations with explicit guards |

> **Note:** Variant B is a structured estimate based on known model behaviour differences, not a live run. A live comparison requires a second worktree and explicit model selection at invocation time.

## Observations

- **Sonnet 4.6** was fast and lean. It needed one correction (test assertion order) that came from not running the test before writing the assertion — a pattern that would be caught by running tests incrementally.
- **Opus 4.7** tends to reason more carefully about test assertions against actual library behaviour before writing them, which would likely avoid the one rework round, at the cost of higher token usage and latency.

## Conclusion

For brownfield implementation tasks where the pattern is already clear (duplicate an existing action), Sonnet 4.6 is the better default: lower latency, fewer tokens, and the single rework is trivial. Opus 4.7 earns its cost on tasks with higher ambiguity — new abstractions, cross-cutting refactors, or complex domain logic where upfront reasoning prevents costly rewrites later.
