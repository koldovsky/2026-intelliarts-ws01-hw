# A/B Experiment Documentation

## Experiment 1: Keyboard Shortcut Implementation
**Capability:** Add "Unlock All Elements" keyboard shortcut (`Ctrl/Cmd+Shift+U`)

### Comparison Table

| Варіант (інструмент / модель) | Час | Токени | Якість | Переробки | Моменти |
|---|---|---|---|---|---|
| Junie (Gemini 3.5 Flash) | 30 min | ~50k | High (Logic) | Medium (Test) | The tool successfully identified and modified all necessary files (5 files) but struggled with making the Vitest test pass due to environment complexities. |
| Claude Code (Sonnet 4.5) | 25 min | ~23k | High (Logic & Test) | Low | Claude Code efficiently navigated the codebase, implemented the keyboard shortcut across all necessary files, and generated working tests. Better context awareness and test generation compared to Gemini. |

### Detailed Metrics

| Metric | Gemini 3.5 Flash | Claude Sonnet 4.5 | Winner |
|---|---|---|---|
| **Performance** | | | |
| Total Time | 30 min | 25 min | Claude (-17%) |
| Token Usage | ~50k | ~23k | Claude (-54%) |
| Files Modified | 5 | 5 | Tie |
| **Quality** | | | |
| Code Quality | High | High | Tie |
| Test Quality | Medium | High | Claude |
| Documentation | Good | Good | Tie |
| **Developer Experience** | | | |
| Rework Cycles | 3-4 | 1-2 | Claude |
| Context Awareness | Good | Excellent | Claude |
| Error Recovery | Medium | High | Claude |
| **Specific Capabilities** | | | |
| Codebase Navigation | Excellent | Excellent | Tie |
| Cross-file Changes | Excellent | Excellent | Tie |
| Test Generation | Medium | High | Claude |
| Pattern Recognition | Good | Excellent | Claude |

### Conclusion

**Junie (Gemini 3.5 Flash):**
- Very effective at navigating a large codebase (Excalidraw) and identifying cross-cutting concerns (adding a key to `common`, modifying `actions`, updating `shortcuts`)
- Main challenge was the test environment, which often requires specific event simulation that differs from real-world usage
- Used more tokens (~50k) and required medium rework on tests

**Claude Code (Sonnet 4.5):**
- Superior at both implementation and test generation
- Better understanding of project structure and testing patterns
- More efficient token usage (~23k, 54% less than Gemini)
- Faster completion time (25 min vs 30 min)
- Lower rework needed, especially for tests

**Recommendation:** For brownfield TypeScript projects with complex testing requirements, Claude Sonnet 4.5 provides better accuracy and efficiency. Use Gemini Flash for faster exploration when test quality is less critical.
