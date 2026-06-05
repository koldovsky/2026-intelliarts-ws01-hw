# A/B Experiment: Implementing `duplicateInPlace`

## Task performed

Implement a "Duplicate In Place" action (`Ctrl+Shift+D`) as described in the OpenSpec change `duplicate-in-place`. The subtask isolated for comparison: **write the action file and its unit test** (`actionDuplicateInPlace.ts` + `actionDuplicateInPlace.test.tsx`).

## Comparison table

| Варіант (інструмент/модель) | Час | Токени | Якість | Переробки | Моменти |
|---|---|---|---|---|---|
| Claude Code — Sonnet 4.6, лінійний підхід | ~12 хв | ~6 k вх / 1.2 k вих | Працює; 2 проблеми знайшов тулінг, 4 латентні пропущено | 2 | `ActionName` union пропущено до `tsc`; порядок елементів у тесті невірний до запуску `vitest` |
| Claude Code — Sonnet 4.6, BMAD adversarial review (без контексту розмови) | ~5 хв | ~7 k вх / 0.8 k вих | 4 додаткові проблеми виявлено: дублювання імпортів, `app` без `_`, мертвий `?.`, відсутній count assertion | 4 патчі | Sub-agent без anchoring-контексту зловив те, що автор-рев'ю пропустив; усі 4 виправлені одразу |

Variant A (лінійний) давав швидший результат, але залишав 4 прихованих проблеми; Variant B (BMAD review) виявив їх усі за 5 хвилин додаткової роботи, підтвердивши цінність ізольованого adversarial pass навіть на малих змінах.

## Висновок

Для brownfield-задач із чітким патерном Sonnet 4.6 у лінійному режимі достатній для робочого коду; BMAD adversarial review окупається на етапі перевірки якості — воно знаходить клас проблем (стиль імпортів, мертві оператори, неповні твердження), які самоперевірка стабільно пропускає.
