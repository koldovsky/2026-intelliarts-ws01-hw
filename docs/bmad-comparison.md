# Task 5 — BMAD Quick Flow vs linear (OpenSpec) for WebP export

Same capability: **Export to WebP** from the image export dialog.  
Baseline: no WebP export (`39c84f5`).

## Approaches compared

| | **Linear (OpenSpec)** | **BMAD Quick Flow** |
|--|----------------------|---------------------|
| **Workflow** | `proposal.md` → `design.md` → delta `spec.md` → `tasks.md` → implement → `openspec validate` → archive | `bmad-spec` → `SPEC.md` + companion → `bmad-quick-dev` → `export-webp.md` impl spec → implement → verify |
| **Planning artifacts** | 4+ files under `openspec/changes/<change>/` (+ main spec after archive) | `SPEC.md` (5-field kernel) + `export-pipeline.md` + `export-webp.md` (tasks, AC, code map) under `_bmad-output/` |
| **Reference in repo** | Cursor: commit `0e47bff` (archived `export-webp`) | This run: `_bmad-output/`, worktree branch `ws01/bmad-webp-experiment` |
| **Code delta (impl only)** | ~141 LOC, 7 package files (same shape as BMAD worktree) | ~141 LOC, 7 package files |
| **Tests** | Cursor/OpenSpec path: `exportCanvas.test.ts` | Included in BMAD impl spec tasks |
| **Wall time (this run)** | See Task 4 (`docs/ab-experiment.md`) | ~5 min (install + SPEC + impl spec + worktree impl; Node 22 via Homebrew for installer) |

## Process differences

- **OpenSpec** — requirement scenarios (WHEN/THEN), explicit change folder, `openspec validate`, archive to `openspec/specs/`.
- **BMAD** — SPEC kernel (Why, Capabilities, Constraints, Non-goals, Success signal), frozen intent block in impl spec, code map + task checklist, optional adversarial review step (`bmad-review-adversarial-general`).

## Outcome quality (same brownfield task)

| Criterion | Linear (Cursor `0e47bff`) | BMAD (this run) |
|-----------|---------------------------|-----------------|
| Fits assignment slice | Yes — button + pipeline + tests + `en.json` | Yes — same minimal slice per SPEC |
| Scope creep | Low (Cursor) / higher (Claude: quality slider, no tests) | Low — Non-goals enforced in SPEC |
| Traceability | OpenSpec delta + archive | SPEC + impl spec + `.decision-log` pattern (spec folder) |
| Repo noise | Main spec + archive dir | `_bmad-output/` only (installer not in git) |

## Conclusion

- **Same feature, similar code** when both follow the PNG export pattern (~7 files, ~140 LOC).
- **Linear/OpenSpec** fits WS1 Task 3 checklist (validate, archive, Memory Bank) in one toolchain already used in the repo.
- **BMAD Quick Flow** adds a structured **SPEC kernel** and **implementation spec** with frozen intent and AC; good when you want one folder contract (`_bmad-output/`) and skill-driven steps without maintaining OpenSpec YAML.
- **Pick OpenSpec** for homework DoD and CodeRabbit OpenSpec checks; **pick BMAD** for guided quick features with built-in review/defer workflow when the team standardizes on `_bmad`.

## Reproduce BMAD locally

Requires **Node.js ≥ 20.12**. From repo root:

```bash
npx bmad-method install --yes --directory . --modules bmm --tools cursor
```

Creates `_bmad/` and `.agents/skills/` (gitignored). Artifacts from this run are under `_bmad-output/`.
