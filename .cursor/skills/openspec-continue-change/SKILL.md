---
name: openspec-continue-change
description: Continue creating planning artifacts for an in-progress OpenSpec change. Use when apply is blocked by missing artifacts or the user wants to resume spec/proposal work. Invoked via `/opsx-continue`.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
---

Continue an in-progress OpenSpec change — create remaining planning artifacts until apply-ready.

**Input**: Optionally specify a change name. If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

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
   Parse the JSON to get:
   - `applyRequires`: artifact IDs needed before implementation
   - `artifacts`: list of all artifacts with their status and dependencies
   - `planningHome`, `changeRoot`, `artifactPaths`, and `actionContext`: path and scope context

   If all `applyRequires` artifacts are already `done`, tell the user the change is apply-ready and suggest `/opsx-apply`.

3. **Create remaining artifacts in sequence**

   Use the **TodoWrite tool** to track progress.

   Loop through artifacts in dependency order (artifacts with no pending dependencies first):

   a. **For each artifact that is `ready` and not yet `done`**:
      - Get instructions: `openspec instructions <artifact-id> --change "<name>" --json`
      - Read completed dependency files for context
      - Create the artifact file using `template` and write it to `resolvedOutputPath`
      - Apply `context` and `rules` as constraints — do NOT copy them into the file
      - Show brief progress: "Created <artifact-id>"

   b. **After each artifact**, re-run `openspec status --change "<name>" --json`
      - Stop when every artifact ID in `applyRequires` has `status: "done"`

   c. **If an artifact requires user input**, use **AskUserQuestion tool** to clarify, then continue

4. **Show final status**
   ```bash
   openspec status --change "<name>"
   ```

**Output**

Summarize change name, artifacts created this session, and prompt: "Run `/opsx-apply` to start implementing."

**Guardrails**
- Do NOT run `openspec new change` — resume existing changes only
- Skip artifacts already `done` unless the user asks to revise them
- Verify each artifact file exists after writing before proceeding
