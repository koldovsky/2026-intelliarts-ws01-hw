import { ORIG_ID } from "@excalidraw/common";

import { Excalidraw } from "../index";
import { API } from "../tests/helpers/api";
import {
  act,
  assertElements,
  getCloneByOrigId,
  render,
} from "../tests/test-utils";

import { actionDuplicateInPlace } from "./actionDuplicateInPlace";

const { h } = window;

describe("actionDuplicateInPlace", () => {
  beforeEach(async () => {
    await render(<Excalidraw />);
  });

  it("duplicates a rectangle at the exact same position", async () => {
    const rectangle = API.createElement({
      type: "rectangle",
      x: 100,
      y: 200,
      width: 50,
      height: 50,
    });

    API.setElements([rectangle]);
    API.setSelectedElements([rectangle]);

    act(() => {
      h.app.actionManager.executeAction(actionDuplicateInPlace);
    });

    assertElements(h.elements, [
      { id: rectangle.id },
      { [ORIG_ID]: rectangle.id, selected: true },
    ]);

    const clone = getCloneByOrigId(rectangle.id);
    expect(clone.x).toBe(rectangle.x);
    expect(clone.y).toBe(rectangle.y);
  });

  it("is a no-op when nothing is selected", async () => {
    const rectangle = API.createElement({ type: "rectangle" });

    API.setElements([rectangle]);
    API.setSelectedElements([]);

    const elementsBefore = h.elements.length;

    act(() => {
      h.app.actionManager.executeAction(actionDuplicateInPlace);
    });

    expect(h.elements.length).toBe(elementsBefore);
  });

  it("duplicates multiple elements in place", async () => {
    const rect1 = API.createElement({ type: "rectangle", x: 0, y: 0 });
    const rect2 = API.createElement({ type: "rectangle", x: 100, y: 100 });

    API.setElements([rect1, rect2]);
    API.setSelectedElements([rect1, rect2]);

    act(() => {
      h.app.actionManager.executeAction(actionDuplicateInPlace);
    });

    assertElements(h.elements, [
      { id: rect1.id },
      { [ORIG_ID]: rect1.id, selected: true },
      { id: rect2.id },
      { [ORIG_ID]: rect2.id, selected: true },
    ]);

    expect(getCloneByOrigId(rect1.id)?.x).toBe(rect1.x);
    expect(getCloneByOrigId(rect1.id)?.y).toBe(rect1.y);
    expect(getCloneByOrigId(rect2.id)?.x).toBe(rect2.x);
    expect(getCloneByOrigId(rect2.id)?.y).toBe(rect2.y);
  });

  it("duplicates frame and its child in place", async () => {
    const frame = API.createElement({ type: "frame" });
    const rectangle = API.createElement({
      type: "rectangle",
      frameId: frame.id,
    });

    API.setElements([frame, rectangle]);
    API.setSelectedElements([frame]);

    act(() => {
      h.app.actionManager.executeAction(actionDuplicateInPlace);
    });

    assertElements(h.elements, [
      { id: frame.id },
      { id: rectangle.id, frameId: frame.id },
      { [ORIG_ID]: rectangle.id, frameId: getCloneByOrigId(frame.id)?.id },
      { [ORIG_ID]: frame.id, selected: true },
    ]);

    const clonedFrame = getCloneByOrigId(frame.id);
    expect(clonedFrame.x).toBe(frame.x);
    expect(clonedFrame.y).toBe(frame.y);
  });

  it("selects only the duplicated elements after action", async () => {
    const rect1 = API.createElement({ type: "rectangle" });
    const rect2 = API.createElement({ type: "ellipse" });

    API.setElements([rect1, rect2]);
    API.setSelectedElements([rect1]);

    act(() => {
      h.app.actionManager.executeAction(actionDuplicateInPlace);
    });

    assertElements(h.elements, [
      { id: rect1.id },
      { [ORIG_ID]: rect1.id, selected: true },
      { id: rect2.id },
    ]);

    const selectedIds = Object.keys(h.state.selectedElementIds);
    expect(selectedIds).toHaveLength(1);
    expect(selectedIds[0]).toBe(getCloneByOrigId(rect1.id).id);
  });
});