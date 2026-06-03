import { describe, it, expect } from "vitest";
import { parseCodeBlock, getRenderableText } from "./textCodeBlock";

describe("parseCodeBlock", () => {
  it("detects a valid fenced code block", () => {
    const result = parseCodeBlock("```\ncode here\n```");
    expect(result).toEqual({ code: "code here" });
  });

  it("detects a code block with language identifier", () => {
    const result = parseCodeBlock("```ts\nconst x = 1;\n```");
    expect(result).toEqual({ code: "const x = 1;" });
  });

  it("returns null for missing closing fence", () => {
    const result = parseCodeBlock("```\ncode here");
    expect(result).toBeNull();
  });

  it("returns null for plain text", () => {
    const result = parseCodeBlock("just regular text");
    expect(result).toBeNull();
  });

  it("handles multi-line code content", () => {
    const result = parseCodeBlock("```\nline1\nline2\nline3\n```");
    expect(result).toEqual({ code: "line1\nline2\nline3" });
  });
});

describe("getRenderableText", () => {
  it("returns code content for a valid code block", () => {
    expect(getRenderableText("```\nconst x = 1;\n```")).toBe("const x = 1;");
  });

  it("returns original text for non-code-block text", () => {
    expect(getRenderableText("hello world")).toBe("hello world");
  });

  it("returns original text for malformed fences", () => {
    expect(getRenderableText("```\nno closing")).toBe("```\nno closing");
  });
});
