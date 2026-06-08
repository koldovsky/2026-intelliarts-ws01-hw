# A/B Experiment: Gemini 3.5 Flash vs Manual Implementation (Junie)

| Варіант (інструмент / модель) | Час | Токени | Якість | Переробки | Моменти |
|---|---|---|---|---|---|
| Junie (Gemini 3.5 Flash) | 30 min | ~50k | High (Logic) | Medium (Test) | The tool successfully identified and modified all necessary files (5 files) but struggled with making the Vitest test pass due to environment complexities. |

## Conclusion
Junie is very effective at navigating a large codebase (Excalidraw) and identifying cross-cutting concerns (adding a key to `common`, modifying `actions`, updating `shortcuts`). The main challenge was the test environment, which often requires specific event simulation that differs from real-world usage.
