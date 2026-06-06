# BMAD Quick Flow vs Linear (OpenSpec) Approach

Порівняння двох підходів на підзадачі: реалізація `parseCodeBlock` / `getRenderableText` для fenced code blocks у `packages/element/src/textCodeBlock.ts`.

## Підходи

### Linear (OpenSpec) — Runs A & B

**Процес:**
1. Spec отримано (з openspec/specs/)
2. Один агент реалізує: написати код → написати тести → перевірити
3. `openspec validate --strict`
4. `openspec archive`

**Фактичні метрики:**
- Час: ~2–3 хв
- Артефакти: spec + impl (11 рядків) + tests (8 тестів)
- Ітерації: 0
- Рев'ю: openspec validate (формальна перевірка)

### BMAD Quick Flow (теоретичний)

**Процес (Barry — Quick Flow Solo Dev):**
1. **QS (Quick Spec)** — Barry створює легковаговий tech spec: scope, pattern, acceptance criteria
2. **QD (Quick Dev)** — Barry реалізує код, пише тести, запускає, сам перевіряє
3. **CR (Code Review)** — adversarial review окремим агентом (або self-review)

**Прогнозовані метрики:**
- Час: ~8–15 хв (QS ~3–5 хв, QD ~3–5 хв, CR ~2–5 хв)
- Артефакти: Quick Spec + impl + tests + review findings
- Ітерації: залежить від review findings
- Рев'ю: adversarial + self-review

## Порівняльна таблиця

| Аспект | Linear (OpenSpec) | BMAD Quick Flow |
|---|---|---|
| **Ceremony** | Мінімальна — 1 команда | Низька — 3 послідовні workflow |
| **Час до результату** | ~2–3 хв | ~8–15 хв |
| **Артефакти** | Spec + impl + tests | Quick Spec + impl + tests + CR findings |
| **QA глибина** | Формальна валідація | Self-check + adversarial review |
| **Реворки** | 0 (на практиці) | 0–1 (залежить від CR) |
| **Аудит / traceability** | Spec + archived change | Quick Spec + impl + review log |
| **Найкраще для** | Дуже малі, ізольовані задачі | Задачі, де потрібен легкий audit trail |
| **Найгірше для** | Коли scope нечіткий або зростає | Коли треба максимально швидко зафікситити |

## Висновок для цієї підзадачі

- **parser** (11 рядків, 1 regex, 0 dependencies) — це **мінімальна задача**, де BMAD Quick Flow додає більше overhead, ніж користі.
- Linear підхід оптимальний для таких вузьких ізольованих slices: spec вже є, реалізація тривіальна, тести пишуться за 1 хв.
- BMAD Quick Flow виграв би, якби:
  - Scope був нечіткий (потрібен QS для прояснення)
  - Задача зачіпала кілька файлів / систем (потрібен plan + CR)
  - Була потреба в adversarial review для критичного коду

## Де використовувати кожен підхід

| Ситуація | Рекомендація |
|---|---|
| 1–2 файли, < 20 рядків коду, spec готовий | **Linear** |
| Bug fix з чітким reproduction | **Linear** |
| Нова фіча, яка зачіпає 3+ файли | **BMAD Quick Flow** |
| Рефакторинг з ризиком регресії | **BMAD Quick Flow** (особливо CR) |
| Експеримент / прототип | **Linear** |
| Код, який іде в production під compliance | **BMAD Quick Flow** (для audit trail) |
