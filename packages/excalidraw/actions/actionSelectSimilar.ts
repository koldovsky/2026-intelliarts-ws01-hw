import { getNonDeletedElements } from "@excalidraw/element";
import { isTextElement } from "@excalidraw/element";

import { KEYS } from "@excalidraw/common";

import { selectGroupsForSelectedElements } from "@excalidraw/element";

import { CaptureUpdateAction } from "@excalidraw/element";

import type { ExcalidrawElement } from "@excalidraw/element/types";

import { selectAllIcon } from "../components/icons";

import { register } from "./register";

export const actionSelectSimilar = register({
  name: "selectSimilar",
  label: "labels.selectSimilar",
  icon: selectAllIcon,
  trackEvent: { category: "canvas" },
  viewMode: false,
  predicate: (elements, appState) =>
    Object.keys(appState.selectedElementIds).length > 0,
  perform: (elements, appState, value, app) => {
    if (appState.selectedLinearElement?.isEditing) {
      return false;
    }

    const selectedTypes = new Set(
      elements
        .filter((element) => appState.selectedElementIds[element.id])
        .map((element) => element.type),
    );

    if (selectedTypes.size === 0) {
      return false;
    }

    const selectedElementIds = elements
      .filter(
        (element) =>
          !element.isDeleted &&
          selectedTypes.has(element.type) &&
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
        selectedLinearElement: null,
      },
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
  keyTest: (event) =>
    event[KEYS.CTRL_OR_CMD] &&
    event.shiftKey &&
    event.key.toLowerCase() === KEYS.A,
});
