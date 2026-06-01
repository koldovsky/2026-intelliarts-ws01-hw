import { isExportShortcut, KEYS } from "./keys";

const makeEvent = (over: Record<string, unknown> = {}) =>
  ({
    key: KEYS.E,
    code: "KeyE",
    shiftKey: true,
    ctrlKey: true,
    metaKey: true,
    ...over,
  } as unknown as KeyboardEvent);

describe("isExportShortcut", () => {
  it("matches Ctrl/Cmd + Shift + E", () => {
    expect(isExportShortcut(makeEvent())).toBe(true);
  });

  it("requires the Shift modifier", () => {
    expect(isExportShortcut(makeEvent({ shiftKey: false }))).toBe(false);
  });

  it("requires Ctrl/Cmd", () => {
    expect(
      isExportShortcut(makeEvent({ ctrlKey: false, metaKey: false })),
    ).toBe(false);
  });

  it("ignores other keys", () => {
    expect(isExportShortcut(makeEvent({ key: "a", code: "KeyA" }))).toBe(false);
  });
});
