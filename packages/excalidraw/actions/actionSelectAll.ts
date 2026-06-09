import { getNonDeletedElements } from "@excalidraw/element";
import { LinearElementEditor } from "@excalidraw/element";
import { isLinearElement, isTextElement } from "@excalidraw/element";

import { arrayToMap, KEYS } from "@excalidraw/common";

import { selectGroupsForSelectedElements } from "@excalidraw/element";

import { CaptureUpdateAction } from "@excalidraw/element";

import type { ExcalidrawElement } from "@excalidraw/element/types";

import { selectAllIcon } from "../components/icons";

import { register } from "./register";
import type { AppClassProperties, AppState } from "../types";

export const actionSelectAll = register({
  name: "selectAll",
  label: "labels.selectAll",
  icon: selectAllIcon,
  trackEvent: { category: "canvas" },
  viewMode: false,
  perform: (elements, appState, value, app) => {
    if (appState.selectedLinearElement?.isEditing) {
      return false;
    }

    const selectedElementIds = elements
      .filter(
        (element) =>
          !element.isDeleted &&
          !(isTextElement(element) && element.containerId) &&
          !element.locked,
      )
      .reduce((map: Record<ExcalidrawElement["id"], true>, element) => {
        map[element.id] = true;
        return map;
      }, {});

    return {
      appState: {
        ...appState,
        ...selectGroupsForSelectedElements(
          {
            editingGroupId: null,
            selectedElementIds,
          },
          getNonDeletedElements(elements),
          appState,
          app,
        ),
        selectedLinearElement:
          // single linear element selected
          Object.keys(selectedElementIds).length === 1 &&
          isLinearElement(elements[0])
            ? new LinearElementEditor(elements[0], arrayToMap(elements))
            : null,
      },
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
  keyTest: (event) => event[KEYS.CTRL_OR_CMD] && event.key === KEYS.A,
});

export const actionSelectSameType = register({
  name: "selectSameType",
  label: "labels.selectSameType",
  trackEvent: { category: "canvas" },
  viewMode: false,
  perform: (elements, appState, _value, app) => {
    const nonDeleted = getNonDeletedElements(elements);
    const selectedElements = app.scene.getSelectedElements({
      selectedElementIds: appState.selectedElementIds,
      elements: nonDeleted,
    });

    if (selectedElements.length === 0) {
      return false;
    }

    const selectedTypes = new Set(selectedElements.map((el) => el.type));

    const selectedElementIds = nonDeleted
      .filter((el) => selectedTypes.has(el.type) && !el.locked)
      .reduce((map: Record<ExcalidrawElement["id"], true>, el) => {
        map[el.id] = true;
        return map;
      }, {});

    return {
      appState: {
        ...appState,
        ...selectGroupsForSelectedElements(
          { editingGroupId: null, selectedElementIds },
          nonDeleted,
          appState,
          app,
        ),
      },
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
  keyTest: (event) => event.altKey && event.key === KEYS.T,
});
