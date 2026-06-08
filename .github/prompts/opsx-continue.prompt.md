---
description: Continue creating planning artifacts for an OpenSpec change
---

Continue an in-progress OpenSpec change — create remaining planning artifacts until apply-ready.

**Input**: Optionally specify a change name (e.g., `/opsx-continue add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run `openspec list --json` to get available changes and use the **AskUserQuestion tool** to let the user select

   Always announce: "Using change: <name>" and how to override (e.g., `/opsx-continue <other>`).

   If no active changes exist, suggest `/opsx-propose` to start a new change.

2. **Check status and remaining artifacts**
   ```bash
   openspec status --change "<name>" --json
   ```
   Parse the JSON to get `applyRequires`, `artifacts`, `planningHome`, `changeRoot`, `artifactPaths`, and `actionContext`.

   If all `applyRequires` artifacts are already `done`, tell the user the change is apply-ready and suggest `/opsx-apply`.

3. **Create remaining artifacts in sequence**

   Use the **TodoWrite tool** to track progress. Loop through artifacts in dependency order. For each artifact that is `ready` and not `done`, run `openspec instructions <artifact-id> --change "<name>" --json`, read dependencies, write to `resolvedOutputPath`, then re-check status until all `applyRequires` artifacts are `done`.

4. **Show final status** with `openspec status --change "<name>"` and prompt `/opsx-apply`.

**Guardrails**
- Do NOT run `openspec new change`
- Skip artifacts already `done` unless the user asks to revise them
