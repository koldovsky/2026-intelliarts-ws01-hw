# Agent Skills Research

Repeatable workflows in this Excalidraw monorepo that benefit from dedicated Agent Skills.

- Agent rules: [AGENTS.md](../AGENTS.md)
- Patterns: [systemPatterns.md](memory/systemPatterns.md)

---

## Implemented Skills

| Skill | Path | Automates |
|-------|------|-----------|
| **excalidraw-verify** | `.cursor/skills/excalidraw-verify/SKILL.md` | Typecheck, Vitest, ESLint, OpenSpec validation before “done” |
| **excalidraw-feature** | `.cursor/skills/excalidraw-feature/SKILL.md` | Multi-file shape / shortcut / toolbar implementation |

**Suggested workflow:** `openspec-propose` → `excalidraw-feature` → `excalidraw-verify`

OpenSpec skills (`.cursor/skills/openspec-*`) handle spec lifecycle; the skills above cover Excalidraw-specific implementation and verification.

---

## Recommended Skill Candidates

### excalidraw-brownfield

**Why:** Large codebase; agents often open `App.tsx` first or edit the wrong package.

**Would automate:** Package map from [architecture.md](technical/architecture.md) → grep → exemplar → confirm owning package (`excalidraw-app` vs library).

**Triggers:** where is, how does, find code for, explore codebase

**Path:** `.cursor/skills/excalidraw-brownfield/SKILL.md`

---

### excalidraw-action

**Why:** `ActionResult`, `captureUpdate`, and `register()` are easy to get wrong.

**Would automate:** Pick neighbor action → scaffold `perform` → wire `keys.ts` → enforce `syncActionResult`.

**Triggers:** new action, undoable command, register action

**Path:** `.cursor/skills/excalidraw-action/SKILL.md`

Pairs with **excalidraw-feature** for shortcut-heavy work.

---

## Future ideas

| Skill | Note |
| ----- | ---- |
| **excalidraw-export** | Export/import lives in `data/` and `scene/export.ts`, not the action path; automate PNG/SVG/clipboard exemplar → serializer → **excalidraw-verify**. Triggers: export format, clipboard, save as, download. |

---

## Skills Not Recommended

| Idea | Reason |
|------|--------|
| Full repo onboarding generator | Covered by Memory Bank + `AGENTS.md` |
| Repomix / codebase dump | Huge artifacts; listed in `.gitignore` |
| Collab/Firebase wiring | Product-only, environment-specific |
| Locale translator | Many locale files; maintain `en.json` unless doing i18n |
| Duplicate OpenSpec skills | Already in `.cursor/skills/openspec-*` |

---

## SKILL.md Template (New Skills)

```markdown
---
name: excalidraw-<name>
description: <what it does; when to use it — third person>
---

# <Title>

## When to use
## Prerequisites (AGENTS.md, systemPatterns)
## Steps
## Anti-patterns
## Done when
```

---

## Existing OpenSpec Integration

- Skills: `openspec-propose`, `openspec-continue-change`, `openspec-apply-change`, `openspec-archive-change`, `openspec-explore`, `openspec-sync-specs`
- Commands: `/opsx-propose`, `/opsx-continue`, `/opsx-apply`, `/opsx-archive`, `/opsx-sync`, `/opsx-explore` (`.cursor/commands/opsx-*`)

Use OpenSpec for **what** to build; use **excalidraw-feature** for **how** in this codebase; use **excalidraw-verify** before calling work complete.
