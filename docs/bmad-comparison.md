# Task 5 — BMAD Quick Flow vs linear (OpenSpec) for WebP export

Same capability: **Export to WebP** from the image export dialog.  
Brownfield baseline before either run: no WebP in `exportCanvas` or export dialog (`main` before WS1 commit).

## Approaches compared

| | **Linear (OpenSpec + Cursor)** | **BMAD Quick Flow** |
|--|-------------------------------|---------------------|
| **Workflow** | `proposal.md` → `design.md` → delta `spec.md` → `tasks.md` → implement → `openspec validate` → archive | `bmad-spec` → `SPEC.md` + companion → `bmad-quick-dev` → `export-webp.md` impl spec → implement (same slice) |
| **Planning artifacts** | `openspec/changes/archive/2026-06-03-export-webp/` + `openspec/specs/export-webp/spec.md` | `_bmad-output/planning-artifacts/specs/spec-export-webp/` + `_bmad-output/implementation-artifacts/export-webp.md` |
| **Shipped in PR** | Yes — final WebP code on `mfranchuk/ws01-homework` | Artifacts only; code path matches OpenSpec impl (~7 files, ~140 LOC) |
| **Tests** | `exportCanvas.test.ts` in PR | Spec tasks require same test; validated in OpenSpec path |
| **Wall time** | See `docs/ab-experiment.md` (~1–2 min Cursor for impl pass) | ~5 min (install + SPEC + impl spec; Node ≥ 20.12) |

## Process differences

- **OpenSpec** — WHEN/THEN requirements, `openspec validate`, archive to `openspec/specs/`.
- **BMAD** — SPEC kernel (Why, Capabilities, Constraints, Non-goals, Success signal), frozen intent in impl spec, code map + AC checklist.

## Outcome quality

| Criterion | OpenSpec (shipped) | BMAD (this run) |
|-----------|-------------------|------------------|
| Assignment fit | Yes — archive, main spec, tests, `en.json` | Yes — same minimal slice in SPEC non-goals |
| Scope creep | Low | Low — non-goals block quality slider / clipboard |
| Repo footprint | Archive + main spec + code | `_bmad-output/` only (`_bmad/`, `.agents/` gitignored) |

## Conclusion

- **Same feature, similar code** when both follow the PNG export pattern.
- **OpenSpec** fits WS1 Task 3 DoD and CodeRabbit checks; **shipped implementation** uses this path (Cursor).
- **BMAD** adds a compact contract under `_bmad-output/` and skill-driven steps; reinstall tooling with `npx bmad-method` (not committed).
- **Pick OpenSpec** for homework grading; **pick BMAD** when the team wants SPEC kernel + quick-dev without OpenSpec YAML.

## Reproduce BMAD locally

Requires **Node.js ≥ 20.12**. From repo root:

```bash
npx bmad-method install --yes --directory . --modules bmm --tools cursor
```

Creates `_bmad/` and `.agents/skills/` (gitignored). Run artifacts from this homework are under `_bmad-output/`.
