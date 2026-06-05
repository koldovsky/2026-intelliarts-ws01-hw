# BMAD Quick Flow vs. Linear Approach — Comparison

## Subtask

Implement the `duplicateInPlace` action (`Ctrl+Shift+D`) in `packages/excalidraw/actions/`.

Both approaches targeted the same deliverables:
- `actionDuplicateInPlace.ts` — action registration and keyboard binding
- `actionDuplicateInPlace.test.tsx` — unit tests
- `ActionName` type update in `types.ts`
- Export in `index.ts`

---

## Linear Approach (Task 3 — OpenSpec)

**Flow used:**  
Explore codebase → OpenSpec proposal/design/spec → implement → run tests → fix failures → typecheck → archive

**Steps taken:**
1. Read existing `actionDuplicateSelection.tsx` and `actionSelectAll.ts` for patterns
2. Wrote OpenSpec proposal, design, tasks, and spec manually
3. Implemented the action file
4. Wrote tests modelled on `actionDuplicateSelection.test.tsx`
5. Ran tests → 1 failure (expected element order wrong in multi-element test)
6. Fixed the assertion to match actual insertion order
7. Ran typecheck → 1 error (`ActionName` missing `"duplicateInPlace"`)
8. Added entry to `ActionName` union
9. Tests and typecheck clean

**Issues caught by tooling (not by author):** 2  
**Post-implementation review:** none

---

## BMAD Quick Flow (Task 5)

**Flow used:**  
Install BMAD → `bmad-quick-dev` skill → Step 01 (clarify + route to one-shot) → implement → adversarial review sub-agent → classify findings → patch → write spec trace → deferred-work log

**Steps taken:**
1. Installed BMAD (`npx bmad-method install --tools claude-code --yes`)
2. Clarified intent, checked blast radius: zero — routed to **one-shot** path
3. Created `_bmad-output/implementation-artifacts/spec-duplicate-in-place.md` with I/O matrix, code map, tasks, ACs, and verification commands before touching code
4. Implemented (same files as linear approach)
5. Spawned adversarial review sub-agent with **no conversation context** (prevents anchoring bias)
6. Classified 4 findings: 4 patches, 0 defers found in implementation, 1 deferred test gap logged to `deferred-work.md`
7. Applied all patches: consolidated imports, renamed `app` → `_app`, dropped `?.` from `getCloneByOrigId` returns, added element count assertion
8. Tests and typecheck confirmed clean

**Issues caught by adversarial review (would not have been caught by tooling alone):** 4

---

## Comparison Table

| Dimension | Linear (OpenSpec) | BMAD Quick Flow |
|---|---|---|
| **Spec written before code** | Yes (OpenSpec proposal + design + spec) | Yes (BMAD spec with I/O matrix + code map) |
| **Upfront clarity** | Moderate — OpenSpec files are looser; no I/O matrix | High — I/O matrix forced explicit edge-case reasoning before writing a line |
| **Bugs caught before merge** | 2 (by compiler + test runner) | 6 (2 by tooling + 4 by adversarial review) |
| **Adversarial review** | None | Mandatory step; sub-agent with no context (reduces anchoring) |
| **Issues deferred intentionally** | None tracked | 1 logged to `deferred-work.md` with source and date |
| **Artifacts produced** | 4 OpenSpec files + 2 code files | 1 BMAD spec + 2 code files + deferred-work entry |
| **Estimated effort** | ~15 min | ~20 min |
| **Repeatability** | Good — OpenSpec archive preserves intent | High — spec + deferred-work log gives full paper trail for future agents |

---

## Key Observations

**Where BMAD added clear value:**

The adversarial review sub-agent caught four real issues the linear flow missed entirely: the duplicate `@excalidraw/element` import blocks (a latent lint failure), the misleadingly named `app` parameter, the dead `?.` operator masking a throw-on-failure, and the missing element count assertion. None of these would have surfaced from `tsc` or `vitest` alone. The no-context constraint on the sub-agent is the mechanism that makes this work — it cannot rationalise the author's choices because it has never seen them.

**Where linear was sufficient:**

For a single-file, zero-blast-radius change with a clear existing pattern to copy, the OpenSpec path was fast and produced correct code. The two errors caught by tooling (element order and `ActionName`) were trivial to fix. If the adversarial review step is skipped, the linear approach delivers working code in less time.

**When to use which:**

| Use linear (OpenSpec) | Use BMAD Quick Flow |
|---|---|
| Pattern is already established in the codebase | New abstraction or first implementation of a kind |
| Zero blast radius | Cross-cutting changes, touches shared types or utilities |
| Time pressure, tight iteration loop | Pre-merge hardening of important features |
| Single author familiar with the code | New contributor or unfamiliar subsystem |

**Conclusion:** BMAD Quick Flow's primary differentiator is the adversarial review step. On small changes the overhead is about 5 minutes; the return is a class of subtle bugs (style inconsistency, silent error masking, missing assertions) that self-review reliably misses. The structured spec artifact is a secondary benefit — it pays off most when the change will be revisited or handed off.
