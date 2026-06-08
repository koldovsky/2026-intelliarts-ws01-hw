# BMAD Quick Flow vs Linear OpenSpec — Comparison

Comparison based on two shortcut implementations in this repository.

---

## 1. Task Summary

| | Linear OpenSpec | BMAD Quick Flow |
|---|---|---|
| **Feature** | Toggle Midpoint Snapping — `Alt+M` | Unlock All Elements — `Ctrl+Shift+U` |
| **Action** | Add `keyTest` to existing `actionToggleMidpointSnapping` | Add `keyTest` to existing `actionUnlockAllElements` |
| **Scope** | 3 files changed, 1 new test file | 5 files changed, 3 tests added to existing file |
| **Extra scope** | None | Also required `shortcuts.ts` registry entry (`ShortcutName` union + `shortcutMap`) |

The tasks were structurally similar but not identical. `actionUnlockAllElements` needed a `ShortcutName` registry entry because it was being surfaced as a named shortcut; `actionToggleMidpointSnapping` did not. This small difference is noted where relevant below.

---

## 2. Linear OpenSpec Approach Summary

The OpenSpec flow produced four committed artifacts before a line of code was written:

- **`proposal.md`** — problem statement, proposed solution, non-goals, scope, rationale for `Alt+M` over alternatives, effort estimate.
- **`design.md`** — verified source state (quoted actual code), identified reference pattern (`actionToggleObjectsSnapMode`), listed exact diffs per file, documented import rules, confirmed no conflict.
- **`tasks.md`** — pre-implementation checklist of files to read, step-by-step implementation tasks with inline notes, test code written out in full, verification commands, done definition.
- **`specs/toggle-midpoint-snapping/spec.md`** — BDD scenarios (WHEN/THEN) covering all shortcut behaviours, suitable for syncing back to master specs.

A specific implementation decision was made explicit in `tasks.md` before writing any test code:

> jsdom does not propagate `keydown` from `document` to the Excalidraw App's internal handler. Behavior tests use `executeAction` directly; shortcut-matching tests call `keyTest!()` directly.

This prevented a class of test that looks correct but doesn't actually exercise the dispatch path.

---

## 3. BMAD Quick Flow Summary

The BMAD flow ran five specialist roles in sequence across the conversation, then produced one committed artifact:

- **Analyst (Mary)** — explored the repository, confirmed `actionUnlockAllElements` exists, confirmed `KEYS.U` was missing, listed files to change, identified `keyTest` style inconsistency between two patterns in the codebase, rated risks.
- **PM (John)** — wrote problem statement, proposed solution, scope, non-goals, six acceptance criteria, test expectations, done definition.
- **Architect (Winston)** — verified every claim from the Analyst against live source, confirmed no `keyTest` existed, confirmed `KEYS.U` missing, specified exact insertion points with line numbers, chose `event.key` style over `event.code` style with rationale.
- **Story Writer (Scrum Master)** — produced `_bmad-output/implementation-artifacts/1-1-unlock-all-keyboard-shortcut.md` from the template, embedding all upstream context, guardrails, and line-level references.
- **Dev (Amelia)** — implemented the story. Required a second pass to fix two pre-existing issues in `actionToggleMidpointSnapping.test.tsx` introduced by earlier branch work (typecheck: extra arguments to `keyTest`; ESLint: import order and formatting).
- **QA** — reviewed all five changed files against architecture and conventions. Identified one minor i18n namespace inconsistency (acceptable), confirmed no conflicts, flagged `act` import source as a non-issue.

One committed artifact was produced: `_bmad-output/implementation-artifacts/1-1-unlock-all-keyboard-shortcut.md`.

---

## 4. Comparison Table

| Dimension | Linear OpenSpec | BMAD Quick Flow |
|---|---|---|
| **Planning quality** | High. Proposal, design, and tasks each add a distinct layer. Design.md quoted actual source to verify claims. The `event.code` vs `event.key` distinction and jsdom propagation limitation were documented before implementation. | High. Analyst, PM, and Architect each caught real issues (missing `KEYS.U`, `ShortcutName` registry requirement, pattern choice). Architect verified claims from live source. Equivalent depth reached via conversation rather than files. |
| **Speed** | Faster for a practitioner who knows the pattern. Three files written, implement, done. No role-switching overhead. | Slower. Five roles ran sequentially. The story file was produced before implementation began. The dev pass then required a second fix pass for pre-existing issues in branch code. |
| **Risk discovery** | Explicit. `design.md` contained a "Conflict Verification" section and a "No-Change Areas" section. `tasks.md` documented jsdom's key propagation limitation before tests were written. | Distributed across roles. Analyst flagged `KEYS.U` missing and `keyTest` style inconsistency. Architect caught the `shortcuts.ts` registry requirement. QA caught the i18n namespace inconsistency. Nothing was missed, but no single document consolidated all risks. |
| **Implementation clarity** | Very high. `tasks.md` numbered each file change, included the exact code to write, included full test code, and listed verification commands. The implementer needed to make no architectural decisions. | High. The story file provided exact line numbers, the correct pattern to follow, and guardrails. The implementer needed to choose where in the test to insert new cases, which introduced the import-order lint issue. |
| **Test clarity** | Explicit. `tasks.md` contained the complete test file inline. The jsdom limitation was documented and the correct strategy (call `keyTest!` directly, use `executeAction` for behavior) was stated. Tests call `keyTest!` directly rather than `fireEvent.keyDown` from document, avoiding a dispatch propagation issue. | Tests use `fireEvent.keyDown(document, ...)` for the behavior assertions. This pattern may not exercise the Excalidraw App's internal key handler in jsdom (the OpenSpec notes explicitly flag this risk). `yarn test:code` (ESLint) passed; the Jest suite was not run as part of this session. |
| **Documentation overhead** | Moderate. Four files written as pre-implementation artifacts. Specs file is reusable (can be synced to master specs via `/opsx:sync`). All artifacts live in the repo and are git-tracked. | High relative to task size. Five conversation roles produced one committed artifact. The upstream conversation context (Analyst output, PM slice, Architect design) is not persisted as files — only the story file is committed. The story cannot be synced to master specs. |
| **Suitability for small changes** | Well-matched. The artifact set is proportional: proposal (~40 lines), design (~138 lines), tasks (~96 lines). For a 60–90 minute task, this is appropriate overhead that pays for itself through clarity. | Slightly heavy. The five-role flow adds conversation turns that are proportionally large for a 4-file change. Most of the value is in Analyst + Architect; PM and Story Writer produced well-structured but somewhat redundant output given the small scope. |

---

## 5. What BMAD Improved

**Multi-role validation caught more before implementation.** The `ShortcutName` registry requirement (`shortcuts.ts`) was identified by the Architect specifically because the role involved reading the file with fresh purpose. The OpenSpec approach for the midpoint snapping task did not need this step (that action was not in the registry), so the gap would not have been caught by direct analogy.

**Explicit acceptance criteria with predicate interaction.** The PM produced six distinct ACs that distinguished between three keyboard-trigger scenarios (locked+no selection, no locked, with selection). The OpenSpec proposal did not itemise predicate guard cases as separate ACs — they were implicit in the design.

**QA pass as a distinct gate.** The BMAD flow included a formal QA review of all changed files before the session was considered complete. The OpenSpec flow's `tasks.md` included a done definition checklist, but no separate review role. The QA pass here caught the i18n namespace inconsistency and confirmed the `act` import path was acceptable.

---

## 6. What Felt Heavier Than Necessary

**The Story Writer role added limited net value for this task.** The Architect's output already contained exact file paths, line numbers, code patterns, and a files-to-change table. The story file (`1-1-unlock-all-keyboard-shortcut.md`) restated this in a formatted template. For a task this small, the Architect output alone would have been sufficient as the implementation guide.

**PM and Analyst outputs overlapped significantly.** The PM's capability slice (problem statement, non-goals, ACs) largely restated conclusions the Analyst had already reached. For a 60–90 minute task, combining Analyst and PM into a single "scoping" step would lose little and save a conversation turn.

**Conversation context is not persisted.** The Analyst, PM, and Architect outputs exist only in the conversation. If this session were closed and reopened, the only persisted planning artifact is the story file. The OpenSpec artifacts (proposal, design, tasks, spec) are all git-tracked and human-readable independent of any session.

**Pre-existing branch issues surfaced in the dev pass.** The `actionToggleMidpointSnapping.test.tsx` file had typecheck and lint errors from prior work. These were fixed during the BMAD dev pass rather than before. The OpenSpec `tasks.md` for midpoint snapping included explicit verification steps (`yarn test:typecheck`, `yarn test:code`) as checkboxes before marking tasks complete, which would have caught these sooner.

---

## 7. Final Conclusion

| Situation | Recommended approach |
|---|---|
| Change touches ≤ 4 files, pattern is clear, implementer knows the codebase | **Linear OpenSpec.** Lower overhead, all artifacts are git-tracked and reusable, spec file can sync to master specs. |
| Change involves a non-obvious predicate, multiple guard conditions, or an existing action with undocumented interactions | **BMAD Quick Flow.** The multi-role validation is more likely to surface edge cases before implementation. PM-level ACs and QA pass add real value. |
| Team is onboarding to an unfamiliar codebase | **BMAD Quick Flow.** The Analyst and Architect exploration steps produce documented findings that serve as onboarding artifacts even if the implementation is simple. |
| Change will be reviewed by others or needs a traceable rationale trail | **Linear OpenSpec.** The proposal, design, and tasks files are self-contained, readable without the conversation, and git-blamed. |
| Time is the primary constraint | **Linear OpenSpec.** The BMAD flow for this task took significantly more elapsed time due to sequential role execution, even though both approaches reached the same implementation. |

For small capability slices in a known codebase — a new shortcut binding, a toggle flag, a predicate adjustment — the linear OpenSpec approach is proportionate and leaves better-organized artifacts. BMAD Quick Flow earns its overhead when the task involves genuine uncertainty (is the action the right place? does a predicate exist? does a pattern need to be chosen between competing options?) or when a QA gate is operationally required before merge.

In this session, the BMAD Analyst and Architect roles provided real value (both caught the missing `KEYS.U` and the `shortcuts.ts` registry requirement). The PM, Story Writer, and QA roles were structurally useful but added overhead that a single well-structured OpenSpec `tasks.md` could have absorbed.
