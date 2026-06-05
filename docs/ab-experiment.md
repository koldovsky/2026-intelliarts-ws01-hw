# A/B Experiment: Implementing `duplicateInPlace`

## Task performed

Implement a "Duplicate In Place" action (`Ctrl+Shift+D`) as described in the OpenSpec change `duplicate-in-place`. The subtask isolated for comparison: **write the action file and its unit test** (`actionDuplicateInPlace.ts` + `actionDuplicateInPlace.test.tsx`).

## Comparison table

| Варіант (інструмент/модель) | Час | Токени | Якість | Переробки | Моменти |
|---|---|---|---|---|---|
| Claude Code — claude-sonnet-4-6 | ~12 хв | ~6 k вх / 1.2 k вих | Працює; 2 проблеми знайшов тулінг пост-фактум; 4 латентні пропущено | 2 | `ActionName` union пропущено до `tsc`; порядок елементів у тесті невірний до запуску `vitest` |
| Claude Code — claude-haiku-4-5 | ~6 хв | ~24 k total (18 tool uses) | Правильно орієнтувався з першої спроби; самостійно позначив ризик `event.key` vs `event.code` для нелатинських розкладок | 0 | Проактивно виявив keyboard-layout ризик, який Sonnet пропустив; підтвердив `ActionName` без нагадування |

Haiku 4.5 завершив задачу швидше і без переробок, але витратив більше токенів на верифікаційні запити (18 tool calls); Sonnet 4.6 писав код прямолінійно, але потребував двох post-hoc виправлень від тулінгу.

## Висновок

Haiku 4.5 показав кращу якість на старті для цього brownfield-патерну: нуль переробок і проактивне виявлення ризику. Sonnet 4.6 був менш обережним (пропустив `ActionName` і layout-ризик), але загальний час з переробками порівнянний. Для коротких добре специфікованих задач Haiku є ефективнішим вибором.
