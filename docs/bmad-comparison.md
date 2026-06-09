# BMAD Quick Flow vs Linear Approach — Comparison

**Task:** Select Same Type shortcut (Alt+T) in Excalidraw  
**Linear run:** Task 3 (single-agent, spec-first via OpenSpec)  
**BMAD run:** Task 5 (bmad-quick-dev one-shot route)

---

## What each approach produced

| Artifact | Linear (Task 3) | BMAD Quick Flow (Task 5) |
|---|---|---|
| Proposal / Intent doc | `openspec/changes/.../proposal.md` | Inline (no separate file) |
| Design doc | `openspec/changes/.../design.md` | Inline (no separate file) |
| Tasks checklist | `openspec/changes/.../tasks.md` | Inline |
| Behavioral spec | `openspec/.../specs/.../spec.md` | `_bmad-output/.../spec-select-same-type.md` (post-hoc) |
| Implementation | `actionSelectAll.ts` (appended) | `actionSelectAll.ts` (appended) |
| Tests | 5 cases | 7 cases (2 added by review) |
| i18n key | ❌ missing | ✅ added |
| HelpDialog entry | ❌ missing | ✅ added |
| `isEditing` guard | ❌ missing | ✅ added |
| Bound-text exclusion | ❌ missing | ✅ added |
| `selectedLinearElement` reset | ❌ missing | ✅ added |
| Adversarial review | ❌ none | ✅ 10 findings, 8 patched, 1 deferred, 1 rejected |
| Suggested Review Order | ❌ none | ✅ in spec file |

---

## Defects caught only by BMAD adversarial review

The linear approach (including the two A/B model runs) missed all of these:

1. **Missing `selectedLinearElement.isEditing` guard** — firing Alt+T during linear-element point editing would corrupt the editor state.
2. **Bound text elements not excluded** — selecting any text would expand to all labels inside containers, breaking copy/paste invariants.
3. **`selectedLinearElement` not reset** — stale reference after multi-element expansion caused subtle linear-editor rendering bugs.
4. **Missing i18n key** — `labels.selectSameType` showed raw key string in production.
5. **Missing HelpDialog entry** — shortcut was invisible to users via `?` overlay.
6. **Weak no-op test** — did not assert `selectedElementIds` was empty, so a regression could pass silently.
7. **Missing tests** for `containerId` exclusion and `isEditing` guard.

**All 7 were production-relevant.** Items 1–3 were behavioral correctness bugs; 4–5 were UX gaps; 6–7 were test coverage gaps.

---

## Process comparison

| Dimension | Linear | BMAD Quick Flow |
|---|---|---|
| **Phase structure** | Write spec manually → implement → done | Clarify → route → implement → adversarial review → spec trace |
| **Spec timing** | Before code (intentional, part of OpenSpec) | After code (generated as trace) |
| **Review** | None (relied on test suite) | Blind adversarial sub-agent review |
| **Human checkpoints** | None | None (one-shot route skips interactive stops) |
| **Wall time** | ~3–4 min (Sonnet), ~2.5 min (Opus) | ~8–10 min total (impl + review + patches) |
| **Defects shipped** | 7 (all missed) | 0 (all caught + patched) |
| **Output quality** | Functional but incomplete | Correct, consistent with codebase conventions |

---

## When to use each

**Linear approach is better when:**
- The task is trivially small and the blast radius is truly zero (e.g. renaming a constant)
- You already have a thorough spec and the codebase conventions are well-understood
- Speed is the top priority and defects can be caught in code review

**BMAD Quick Flow is better when:**
- The feature touches established patterns you might miss (guards, i18n, help dialogs)
- You want a structured artifact trail (spec + suggested review order) for reviewers
- You want to catch blind spots before code review, not during

**Key insight:** For a 5-file change in a codebase with ~70 registered actions, the linear approach missed 7 edge cases that a 90-second adversarial review caught. The BMAD overhead was dominated by the review sub-agent, not the workflow scaffolding. For larger features, the ROI of the review step increases.
