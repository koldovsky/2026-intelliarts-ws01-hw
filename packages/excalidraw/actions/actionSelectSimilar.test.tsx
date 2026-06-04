import { KEYS } from "@excalidraw/common";

import { Excalidraw } from "../index";
import { API } from "../tests/helpers/api";
import { Keyboard } from "../tests/helpers/ui";
import { render } from "../tests/test-utils";

import { actionSelectSimilar } from "./actionSelectSimilar";

const { h } = window;

const selectedIds = () => Object.keys(h.state.selectedElementIds).sort();

describe("actionSelectSimilar", () => {
  it("selects every element of the same type from a single selection", async () => {
    const r1 = API.createElement({ type: "rectangle", id: "r1" });
    const r2 = API.createElement({ type: "rectangle", id: "r2", x: 200 });
    const e1 = API.createElement({ type: "ellipse", id: "e1", x: 400 });
    const a1 = API.createElement({ type: "arrow", id: "a1", x: 600 });

    await render(<Excalidraw initialData={{ elements: [r1, r2, e1, a1] }} />);

    API.setSelectedElements([r1]);
    API.executeAction(actionSelectSimilar);

    expect(selectedIds()).toEqual(["r1", "r2"]);
  });

  it("selects the union of the selected types for a mixed selection", async () => {
    const r1 = API.createElement({ type: "rectangle", id: "r1" });
    const r2 = API.createElement({ type: "rectangle", id: "r2", x: 200 });
    const e1 = API.createElement({ type: "ellipse", id: "e1", x: 400 });
    const a1 = API.createElement({ type: "arrow", id: "a1", x: 600 });
    const a2 = API.createElement({ type: "arrow", id: "a2", x: 800 });

    await render(
      <Excalidraw initialData={{ elements: [r1, r2, e1, a1, a2] }} />,
    );

    API.setSelectedElements([r1, a1]);
    API.executeAction(actionSelectSimilar);

    expect(selectedIds()).toEqual(["a1", "a2", "r1", "r2"]);
  });

  it("does not select locked elements of the same type", async () => {
    const r1 = API.createElement({ type: "rectangle", id: "r1" });
    const r2 = API.createElement({
      type: "rectangle",
      id: "r2",
      x: 200,
      locked: true,
    });

    await render(<Excalidraw initialData={{ elements: [r1, r2] }} />);

    API.setSelectedElements([r1]);
    API.executeAction(actionSelectSimilar);

    expect(selectedIds()).toEqual(["r1"]);
  });

  it("does not select text that is bound to a container", async () => {
    const container = API.createElement({
      type: "rectangle",
      id: "container",
      boundElements: [{ id: "bound", type: "text" }],
    });
    const boundText = API.createElement({
      type: "text",
      id: "bound",
      containerId: "container",
    });
    const standalone = API.createElement({
      type: "text",
      id: "standalone",
      x: 300,
    });

    await render(
      <Excalidraw
        initialData={{ elements: [container, boundText, standalone] }}
      />,
    );

    API.setSelectedElements([standalone]);
    API.executeAction(actionSelectSimilar);

    expect(selectedIds()).toEqual(["standalone"]);
  });

  it("is a no-op when nothing is selected", async () => {
    const r1 = API.createElement({ type: "rectangle", id: "r1" });
    const e1 = API.createElement({ type: "ellipse", id: "e1", x: 200 });

    await render(<Excalidraw initialData={{ elements: [r1, e1] }} />);

    expect(selectedIds()).toEqual([]);
    API.executeAction(actionSelectSimilar);
    expect(selectedIds()).toEqual([]);
  });

  it("is triggered by the Ctrl/Cmd+Shift+A keyboard shortcut", async () => {
    const r1 = API.createElement({ type: "rectangle", id: "r1" });
    const r2 = API.createElement({ type: "rectangle", id: "r2", x: 200 });
    const e1 = API.createElement({ type: "ellipse", id: "e1", x: 400 });

    await render(
      <Excalidraw
        handleKeyboardGlobally
        initialData={{ elements: [r1, r2, e1] }}
      />,
    );

    API.setSelectedElements([r1]);
    // A real browser reports "A" (uppercase) while Shift is held; firing that is
    // what keeps this distinct from Select all (which matches lowercase "a").
    Keyboard.withModifierKeys({ ctrl: true, shift: true }, () => {
      Keyboard.keyPress("A");
    });

    expect(selectedIds()).toEqual(["r1", "r2"]);
  });

  it("does not collide with Select all - plain Ctrl/Cmd+A still selects everything", async () => {
    const r1 = API.createElement({ type: "rectangle", id: "r1" });
    const r2 = API.createElement({ type: "rectangle", id: "r2", x: 200 });
    const e1 = API.createElement({ type: "ellipse", id: "e1", x: 400 });

    await render(
      <Excalidraw
        handleKeyboardGlobally
        initialData={{ elements: [r1, r2, e1] }}
      />,
    );

    API.setSelectedElements([r1]);
    Keyboard.withModifierKeys({ ctrl: true }, () => {
      Keyboard.keyPress(KEYS.A);
    });

    // Select all ran (every element selected), not Select similar.
    expect(selectedIds()).toEqual(["e1", "r1", "r2"]);
  });
});
