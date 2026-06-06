# A/B Experiment — Run B (Fork Session)

## Spec

Create `packages/element/src/textCodeBlock.ts` with:
- `parseCodeBlock(text: string): { code: string } | null` — regex-based fenced code block detector
- `getRenderableText(text: string): string` — strips fences for measurement

## Metrics

| Метрика | Значення |
|---|---|
| **Інструмент / модель** | opencode / openai/gpt-5.4 |
| **Час (від постановки spec до перевірки тестом)** | ~2 хв |
| **Токени** | н/д у CLI |
| **Рядки коду** | 11 (parser) |
| **Тести** | 8 existing tests re-used |
| **Тести пройшли з першого разу?** | Так ✅ |
| **Переробки / ітерації** | 0 |
| **Якість** | Мінімальна реалізація, без зайвих абстракцій, добре відповідає MVP-scope |
| **Моменти** | Найсильніша сторона цього run — прагматичність: одразу тримає обсяг маленьким і не роздуває рішення |

## Implementation Notes

- Same public contract as Run A
- Same strict regex shape: `/^```(?:\\w+)?\\n([\\s\\S]*?)\\n```$/`
- Verification command: `npx vitest run packages/element/src/textCodeBlock.test.ts`
- Result: 8/8 tests passed
