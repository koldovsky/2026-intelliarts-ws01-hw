# A/B Experiment — Task 3 Capability Re-run

**Capability:** Select Same Type (`Alt+T`)  
**Tool:** Claude Code (same CLI, same prompt, same isolated worktree per run)  
**Axis:** Model — Sonnet 4.6 vs Opus 4.6

Both agents received the identical prompt describing the task, the repo structure,
the files to touch, the pattern to follow, and the tests to write. Each ran in an
isolated git worktree.

---

## Results table

| Variant | Time | Tokens (total) | Tool calls | Tests | TypeScript | Rework |
|---|---|---|---|---|---|---|
| **Sonnet 4.6** | 3m 20s | 44 996 | 28 | 5 / 5 ✅ | Clean ✅ | 0 |
| **Opus 4.6** | 2m 32s | 40 464 | 22 | 5 / 5 ✅ | Clean ✅ | 0 |

---

## Implementation differences

### File structure
Both models chose to create a **separate `actionSelectSameType.ts`** rather than
appending to `actionSelectAll.ts` (the approach taken in the original Task 3 run).
Neither needed to be corrected — both are valid; a standalone file is arguably
cleaner for discoverability.

### Selection retrieval
- **Sonnet** used `app.scene.getSelectedElements(...)` — the scene API, matching
  the pattern in `actionSelectAll` exactly.
- **Opus** bypassed the scene API and filtered `elements` directly:
  `elements.filter(el => selectedElementIds[el.id] && !el.isDeleted)`.
  Functionally equivalent but diverges from the established pattern.

### Filter ordering
- **Sonnet** called `getNonDeletedElements()` first, then filtered on `!locked` —
  slightly more idiomatic (mirrors `actionSelectAll`).
- **Opus** applied `!isDeleted && !locked` inline in a single `.filter()` pass —
  marginally more concise but mixes concerns that the codebase usually separates.

### Import style
- **Sonnet** grouped three imports from `@excalidraw/element` without a type import,
  producing duplicate import declarations from the same module.
- **Opus** used the same three imports but also brought in the
  `ExcalidrawElement` type explicitly for the `Record<…>` annotation — one extra
  line but more precise typing.

### Tests
Both wrote the same 5 cases with near-identical structure. Sonnet's descriptions
were slightly more verbose ("excludes deleted elements from the expanded selection");
Opus's were shorter ("excludes deleted elements"). Both added a third matching
element to the deleted/locked tests, improving coverage over the minimal spec.

---

## Moments / observations

**Sonnet**
- More tool calls (28 vs 22): spent extra turns reading files before writing.
- Followed the scene-API pattern more closely — useful when the team cares about
  internal API consistency.
- Longer wall time despite doing the same amount of work.

**Opus**
- Finished 48 seconds faster with 10% fewer tokens.
- Fewer exploratory reads — made decisions earlier with less verification.
- The direct `elements.filter()` approach shows Opus is comfortable taking a
  slightly different path when it achieves the same result, rather than copying
  the existing pattern exactly.

---

## Conclusion

For a well-scoped, pattern-heavy task with a clear spec both models performed
identically on the outcomes that matter (correctness, tests, types). **Opus 4.6
was faster and cheaper** (−10% tokens, −22% time, −21% tool calls).

The quality difference is subtle: Sonnet stayed closer to existing conventions
(scene API); Opus took a direct route that works but drifts from the codebase
style. In a codebase with strict style rules that drift would require a review
comment; on a greenfield task it would be irrelevant.

**Rule of thumb from this experiment:**
- Use **Sonnet** when stylistic conformance to an existing codebase is important
  and you want it to "read more code before writing."
- Use **Opus** when you need raw speed on a clearly spec-ed task and are
  comfortable reviewing for style drift afterward.
