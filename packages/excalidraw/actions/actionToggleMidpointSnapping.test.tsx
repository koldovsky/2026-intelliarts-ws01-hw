import React from "react";

import { Excalidraw } from "../index";
import { act, render } from "../tests/test-utils";

import { actionToggleMidpointSnapping } from "./actionToggleMidpointSnapping";

const { h } = window;

describe("actionToggleMidpointSnapping", () => {
  beforeEach(async () => {
    await render(<Excalidraw />);
  });

  it("toggles isMidpointSnappingEnabled on", () => {
    const before = h.state.isMidpointSnappingEnabled;
    act(() => {
      h.app.actionManager.executeAction(actionToggleMidpointSnapping);
    });
    expect(h.state.isMidpointSnappingEnabled).toBe(!before);
  });

  it("restores original state on second execution", () => {
    const before = h.state.isMidpointSnappingEnabled;
    act(() => {
      h.app.actionManager.executeAction(actionToggleMidpointSnapping);
    });
    act(() => {
      h.app.actionManager.executeAction(actionToggleMidpointSnapping);
    });
    expect(h.state.isMidpointSnappingEnabled).toBe(before);
  });

  it("keyTest matches Alt+M without Ctrl/Cmd", () => {
    const event = new KeyboardEvent("keydown", {
      altKey: true,
      code: "KeyM",
    });
    expect(actionToggleMidpointSnapping.keyTest!(event as any)).toBe(true);
  });

  it("keyTest does not match Ctrl+Alt+M", () => {
    const event = new KeyboardEvent("keydown", {
      ctrlKey: true,
      altKey: true,
      code: "KeyM",
    });
    expect(actionToggleMidpointSnapping.keyTest!(event as any)).toBe(false);
  });
});
