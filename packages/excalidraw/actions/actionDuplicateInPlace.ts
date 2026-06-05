import { KEYS, arrayToMap } from "@excalidraw/common";

import {
  getNonDeletedElements,
  getSelectedElements,
  getSelectionStateForElements,
  syncMovedIndices,
  duplicateElements,
  CaptureUpdateAction,
} from "@excalidraw/element";

import { isSomeElementSelected } from "../scene";

import { register } from "./register";

export const actionDuplicateInPlace = register({
  name: "duplicateInPlace",
  label: "Duplicate in place",
  trackEvent: { category: "element" },
  perform: (elements, appState, _formData, _app) => {
    if (appState.selectedElementsAreBeingDragged) {
      return false;
    }

    if (appState.selectedLinearElement?.isEditing) {
      return false;
    }

    if (!isSomeElementSelected(getNonDeletedElements(elements), appState)) {
      return false;
    }

    const { duplicatedElements, elementsWithDuplicates } = duplicateElements({
      type: "in-place",
      elements,
      idsOfElementsToDuplicate: arrayToMap(
        getSelectedElements(elements, appState, {
          includeBoundTextElement: true,
          includeElementsInFrames: true,
        }),
      ),
      appState,
      randomizeSeed: true,
    });

    return {
      elements: syncMovedIndices(
        elementsWithDuplicates,
        arrayToMap(duplicatedElements),
      ),
      appState: {
        ...appState,
        ...getSelectionStateForElements(
          duplicatedElements,
          getNonDeletedElements(elementsWithDuplicates),
          appState,
        ),
      },
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
  keyTest: (event) =>
    event[KEYS.CTRL_OR_CMD] &&
    event.shiftKey &&
    event.key === KEYS.D.toUpperCase(),
});