# Agent Skills research

Task 2: which repeatable workflows in this repo are worth turning into Agent Skills, and why. Grounded in the patterns from [systemPatterns](memory/systemPatterns.md) and the boundaries in [AGENTS.md](../AGENTS.md).

## Repeatable workflows found in this repo

Walking the code surfaces a handful of tasks that recur with the same shape every time:

1. Adding a user command (action / keyboard shortcut / toolbar button). The action system is the single extension point for commands. Each one repeats the same boilerplate: define the `Action`, `register` it, write `keyTest`, pick a `captureUpdate`, optionally add a `PanelComponent`, add a test (`packages/excalidraw/actions/`).
2. Adding a new primitive element type. This is the widest fan-out in the repo: the union in `packages/element/src/types.ts`, a factory in `newElement.ts`, a type guard in `typeChecks.ts`, drawing in `renderElement.ts` / `shape.ts`, plus a tool and toolbar entry. Easy to miss one site.
3. Running the verification pipeline and triaging failures. Four independent checks (`test:typecheck`, `test:code`, `test:other`, `test:app`) with strict settings (ESLint `--max-warnings=0`, Prettier `--list-different`, snapshot tests). After an intentional visual change, snapshots in `**/__snapshots__/` need a reviewed `yarn test:update`.
4. Adding or updating i18n strings (`packages/excalidraw/locales/`), kept in sync across the locale files.

Workflows 1 and 2 are the best skill candidates: they recur often, the steps are mechanical but the failure modes are subtle (a wrong `captureUpdate` breaks undo; a missed wiring site leaves an element that silently fails to render or bind), and getting them right needs repo-specific knowledge that is not obvious from any single file.

## Proposed skill 1: `add-action` (scaffold a command)

What it automates: creating a new Action end to end so a contributor only supplies the behaviour, not the wiring.

Why it fits this repo: actions are the canonical way to add any shortcut, menu item, or toolbar control (`packages/excalidraw/actions/`). The wiring is identical every time and easy to get subtly wrong - forgetting to `register`, returning an `ActionResult` without a `captureUpdate`, or choosing `IMMEDIATELY` where `EVENTUALLY`/`NEVER` belongs and corrupting the undo stack.

What the skill would do:

- Ask for the command name, trigger (key combo and/or toolbar), and whether it edits elements, `appState`, or both.
- Generate an action file in `packages/excalidraw/actions/` that calls `register({...})`, implements `perform` returning a correct `ActionResult`, and adds `keyTest` using `KEYS` from `@excalidraw/common`.
- Default `captureUpdate` from the answers (element edit -> `IMMEDIATELY`; pure UI toggle -> often `EVENTUALLY`/`NEVER`) and explain the choice.
- Add a test next to the existing action tests and run `yarn test:app` on it.

Trigger phrases: "add a shortcut", "new toolbar action", "register an action".

## Proposed skill 2: `scaffold-element-type` (add a new primitive element)

What it automates: wiring a new primitive element type into every site Excalidraw requires it, so the author only writes the geometry and rendering, not the bookkeeping.

Why it fits this repo: adding an element type is the widest fan-out in the codebase and the easiest to get partially wrong. A new type has to be added in lockstep to the discriminated union (`packages/element/src/types.ts`), a factory (`newElement.ts`), a type guard (`typeChecks.ts`), the shape generator and draw path (`shape.ts` / `renderElement.ts`), and usually a tool plus a toolbar entry. Miss one of those sites (the type guard or the `ShapeCache` shape generator, say) and the element silently fails to render, bind, or serialize. None of that is obvious from reading a single file, which is exactly what a skill should encode.

What the skill would do:

- Ask for the type name, its geometry (rectanguloid, linear, free), and whether it is bindable / text-containing.
- Trace an existing comparable type (e.g. `rectangle`) and generate the matching edits at each lockstep site, keeping the `version` / `index` bookkeeping intact via the existing factories rather than hand-built literals.
- Add a `ShapeCache` shape generator and a `renderElement` branch.
- Scaffold a test next to the element tests and run `yarn test:app` plus `yarn test:typecheck` on the touched packages.

Trigger phrases: "add a new shape", "new element type", "register a primitive".

(A lighter `verify-changes` helper - run the four gates `test:typecheck` / `test:code` / `test:other` / `test:app` and triage failures, never bypassing the pre-commit hook - is also worth having, but it is closer to a generic CI runner, so it is a lower-priority candidate than the two above.)

## Optional next step

If we add either skill for real, it goes in `.claude/skills/<name>/SKILL.md` (Claude Code) or `.cursor/skills/` (Cursor), with the description tuned to the trigger phrases above. For this homework the research write-up is the required deliverable; shipping a skill file is the optional bonus.
