# WS1 — Практичне завдання (Excalidraw snapshot)

Покрокова інструкція до домашнього завдання воркшопу **Modern AI SDLC:
Greenfield vs Brownfield** (Intelliarts). На ~2–3 год роботи.

> Це **знімок** останнього стану Excalidraw — великого публічного TypeScript-
> моноліту. **Навмисно прибрані** `README.md`, `dev-docs/`, `CLAUDE.md`,
> `CONTRIBUTING.md` та package-README — щоб ви досліджували проєкт і відтворили
> документацію самі. Історії комітів теж немає (один initial commit).
>
> Робота з репо = **brownfield**; додавання нової маленької фічі =
> **greenfield-style capability slice** всередині brownfield.

## 0. Setup (~5 хв)

```bash
gh repo fork koldovsky/2026-intelliarts-ws01-hw --clone
cd 2026-intelliarts-ws01-hw
git checkout -b ws01/<github-username>
```

**Prerequisites:** Cursor / Claude Code (хоча б один) · Node 22+.
CodeRabbit автоматично ревʼюїть ваш PR.

---

## Task 1 — Brownfield onboarding + Memory Bank + docs (~45 хв)

1. **Обмежити контекст** (≥5 патернів) — одним зі способів:
   - **Cursor:** `.cursorignore` у корені
   - **Claude Code:** `.claude/settings.json` → `permissions.deny`: `Read(...)`
     (окремого `.claudeignore` немає; Claude також поважає `.gitignore`)
   Патерни: `node_modules/`, `dist/`, `build/`, `coverage/`, `*.min.js`, `*.snap`,
   lock-файли. **Не** виключайте `packages/**`.
2. **Code Archaeology** (Broad → Narrow → Deep → **Verify**): `@codebase` →
   тека → файл. Завжди звіряйте відповідь AI проти коду.
3. **Memory Bank** (3 файли): `docs/memory/projectbrief.md`, `techContext.md`
   (стек, `yarn`-команди, `packages/`), `systemPatterns.md` (canvas rendering,
   element system, action system, `appState`).
4. **Відтворити технічну документацію** `docs/technical/architecture.md`
   (High-level Architecture, Data Flow, State Management, Rendering Pipeline,
   Package Dependencies) — у репо її **немає**.

**Verification:** CodeRabbit перевіряє наявність і структуру.

---

## Task 2 — Rules + Skills (~30 хв)

1. **Правила проєкту** (специфічні, на основі Memory Bank): `AGENTS.md` **або**
   `.cursor/rules/*.mdc` — конвенції, межі імпортів, команди, що агенту можна/не можна.
2. **Дослідити проєкт під Agent Skills:** які повторювані workflow тут є
   (запуск тестів, новий елемент за патерном, рефактор)? Опишіть 1–2 доречні
   skills у `docs/skills-research.md` (навіщо, що автоматизують). _(опц.)_ додайте
   skill у `.claude/skills/` або `.cursor/skills/`.

**Verification:** CodeRabbit перевіряє правила + `docs/skills-research.md`.

---

## Task 3 — Capability slice з OpenSpec (~60–90 хв)

Оберіть **одну** capability (orientation-хінти — приблизні, перевірте через `@codebase`):

| Capability | Куди дивитися (приблизно) |
|---|---|
| Новий примітивний **shape** | `packages/element/**`, рендеринг елементів, toolbar |
| Новий **keyboard shortcut** | `packages/excalidraw/keys.ts`, `packages/excalidraw/actions/**` |
| Невелика опція в **toolbar** | `packages/excalidraw/components/**` |
| **Export** у новому форматі | `packages/excalidraw/data/**` |

```bash
npx openspec@latest init          # одноразово, якщо немає теки openspec/
#   openspec/changes/<change>/proposal.md, design.md, tasks.md
#   openspec/changes/<change>/specs/<capability>/spec.md   (ДО коду)
# ... імплементація + тест(и) ...
yarn test
npx openspec validate --strict
npx openspec archive <change>
```

Оновіть Memory Bank (`activeContext.md`, `progress.md`).

**Verification:** наявність OpenSpec-артефактів + impl + тест; `openspec validate` проходить.

---

## Task 4 — A/B experiment (~30 хв)

Виконайте **одну** з підзадач Task 3 **двічі** і порівняйте:
- **Маєте 2 інструменти** → Claude Code vs Cursor / Codex / Copilot
- **Маєте 1 інструмент** → **дві різні моделі** в ньому (Sonnet vs Opus; GPT-5 vs GPT-5 mini)

Заповніть `docs/ab-experiment.md`:

| Варіант (інструмент / модель) | Час | Токени | Якість | Переробки | Моменти |
|---|---|---|---|---|---|
| | | | | | |

Додайте короткий висновок «що під що».

---

## Task 5 (bonus) — BMAD Quick Flow

Запустіть BMAD Quick Flow на тій самій підзадачі й порівняйте з лінійним
підходом у `docs/bmad-comparison.md`.

---

## Submission + DoD

```bash
git add .
git commit -m "WS1: <ім'я> — <обрана capability>"
git push -u origin ws01/<github-username>
gh pr create --title "WS1: <ім'я> — <обрана capability>" --fill
```

CodeRabbit зробить авто-рев'ю (1–3 хв): ✅ / ⚠️ / ❌ + pre-merge таблиця.

**Definition of Done**
- [ ] Task 1: `.cursorignore` **або** `.claude/settings.json` (deny) + 3 файли Memory Bank + `docs/technical/architecture.md`
- [ ] Task 2: правила (`AGENTS.md`/`.cursor/rules`) + `docs/skills-research.md`
- [ ] Task 3: повний OpenSpec-цикл + impl + тест
- [ ] Task 4: `docs/ab-experiment.md`
- [ ] Task 5: опціонально

Питання — у чат воркшопу. Я підключаюся з рев'ю на ключові моменти протягом 2 тижнів.
