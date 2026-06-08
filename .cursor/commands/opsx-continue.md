---
name: /opsx-continue
id: opsx-continue
category: Workflow
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
   Parse the JSON to get:
   - `applyRequires`: artifact IDs needed before implementation (e.g., `["tasks"]`)
   - `artifacts`: list of all artifacts with their status and dependencies
   - `planningHome`, `changeRoot`, `artifactPaths`, and `actionContext`: path and scope context

   If all `applyRequires` artifacts are already `done`, tell the user the change is apply-ready and suggest `/opsx-apply`.

3. **Create remaining artifacts in sequence**

   Use the **TodoWrite tool** to track progress.

   Loop through artifacts in dependency order (artifacts with no pending dependencies first):

   a. **For each artifact that is `ready` (dependencies satisfied) and not yet `done`**:
      - Get instructions:
        ```bash
        openspec instructions <artifact-id> --change "<name>" --json
        ```
      - Read completed dependency files for context
      - Create the artifact file using `template` as the structure and write it to `resolvedOutputPath`
      - Apply `context` and `rules` as constraints — do NOT copy them into the file
      - Show brief progress: "Created <artifact-id>"

   b. **After each artifact**, re-run `openspec status --change "<name>" --json`
      - Stop when every artifact ID in `applyRequires` has `status: "done"`

   c. **If an artifact requires user input** (unclear context):
      - Use **AskUserQuestion tool** to clarify
      - Then continue with creation

4. **Show final status**
   ```bash
   openspec status --change "<name>"
   ```

**Output**

After completing remaining artifacts, summarize:
- Change name and location
- Artifacts created or updated this session
- What's ready: "All planning artifacts complete! Ready for implementation."
- Prompt: "Run `/opsx-apply` to start implementing."

**Guardrails**
- Do NOT run `openspec new change` — this command resumes an existing change only
- Skip artifacts that are already `done` unless the user asks to revise them
- Always read dependency artifacts before creating a new one
- Verify each artifact file exists after writing before proceeding to next
