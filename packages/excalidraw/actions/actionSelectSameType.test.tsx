import React from "react";

import { Excalidraw } from "../index";
import { API } from "../tests/helpers/api";
import { act, assertElements, render } from "../tests/test-utils";

import { actionSelectSameType } from "./actionSelectAll";

const { h } = window;

describe("actionSelectSameType", () => {
  beforeEach(async () => {
    await render(<Excalidraw />);
  });

  it("does nothing when nothing is selected", async () => {
    const r1 = API.createElement({ type: "rectangle" });
    const e1 = API.createElement({ type: "ellipse" });

    API.setElements([r1, e1]);
    API.setSelectedElements([]);

    act(() => {
      h.app.actionManager.executeAction(actionSelectSameType);
    });

    assertElements(h.elements, [
      { id: r1.id },
      { id: e1.id },
    ]);
  });

  it("selects all elements of the same type as the selected element", async () => {
    const r1 = API.createElement({ type: "rectangle" });
    const r2 = API.createElement({ type: "rectangle" });
    const e1 = API.createElement({ type: "ellipse" });

    API.setElements([r1, r2, e1]);
    API.setSelectedElements([r1]);

    act(() => {
      h.app.actionManager.executeAction(actionSelectSameType);
    });

    assertElements(h.elements, [
      { id: r1.id, selected: true },
      { id: r2.id, selected: true },
      { id: e1.id },
    ]);
  });

  it("selects all types when multiple types are in the initial selection", async () => {
    const r1 = API.createElement({ type: "rectangle" });
    const r2 = API.createElement({ type: "rectangle" });
    const e1 = API.createElement({ type: "ellipse" });
    const e2 = API.createElement({ type: "ellipse" });
    const d1 = API.createElement({ type: "diamond" });

    API.setElements([r1, r2, e1, e2, d1]);
    API.setSelectedElements([r1, e1]);

    act(() => {
      h.app.actionManager.executeAction(actionSelectSameType);
    });

    assertElements(h.elements, [
      { id: r1.id, selected: true },
      { id: r2.id, selected: true },
      { id: e1.id, selected: true },
      { id: e2.id, selected: true },
      { id: d1.id },
    ]);
  });

  it("does not select deleted elements", async () => {
    const r1 = API.createElement({ type: "rectangle" });
    const r2 = API.createElement({ type: "rectangle", isDeleted: true });

    API.setElements([r1, r2]);
    API.setSelectedElements([r1]);

    act(() => {
      h.app.actionManager.executeAction(actionSelectSameType);
    });

    assertElements(h.elements, [
      { id: r1.id, selected: true },
      { id: r2.id, isDeleted: true },
    ]);
  });

  it("does not select locked elements", async () => {
    const r1 = API.createElement({ type: "rectangle" });
    const r2 = API.createElement({ type: "rectangle", locked: true });

    API.setElements([r1, r2]);
    API.setSelectedElements([r1]);

    act(() => {
      h.app.actionManager.executeAction(actionSelectSameType);
    });

    assertElements(h.elements, [
      { id: r1.id, selected: true },
      { id: r2.id },
    ]);
  });
});
