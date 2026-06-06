# A/B Experiment — Run A (Current Model)

## Spec

Create `packages/element/src/textCodeBlock.ts` with:
- `parseCodeBlock(text: string): { code: string } | null` — regex-based fenced code block detector
- `getRenderableText(text: string): string` — strips fences for measurement

## Metrics

| Метрика | Значення |
|---|---|
| **Інструмент / модель** | opencode / big-pickle |
| **Час (від отримання spec до готового тесту)** | ~3 хв |
| **Рядки коду** | 11 (parser) + 43 (tests) = 54 |
| **Тести** | 8 (5 parseCodeBlock + 3 getRenderableText) |
| **Тести пройшли з першого разу?** | Так ✅ |
| **Переробки / ітерації** | 0 — жодної переробки при коректному proposal |
| **Якість** | Чистий regex, без зайвих залежностей, коректно обробляє edge cases (без closing fence, language tag, multi-line) |
| **Моменти** | Openspec proposal цієї моделі виявився overhead із пропозицією створити окремий блок. В результаті: порядка 48 тасок, купа помилок, які після резолву поламали зовнішній вигляд згенерованого блоку. Тому відкотився назад та згенерував proposal за допомогою gpt-5.4. Лише тоді Task виявився дуже простим — модель впоралась за одну спробу. Єдиний нюанс: regex має бути strict (`^...$`), що може не сподобатись користувачам з зайвим whitespace |

## Implementation Notes

- Parser standalone, zero dependencies
- Regex: `/^```(?:\w+)?\n([\s\S]*?)\n```$/` — anchors ensure exact match only
- Tests use standard vitest pattern (describe/it/expect)
- All 8 tests pass on first run
