import React from "react";

import { KEYS } from "@excalidraw/common";
import { isFrameLikeElement } from "@excalidraw/element";

import { getShortcutFromShortcutName } from "../actions/shortcuts";
import { Excalidraw } from "../index";

import { API } from "./helpers/api";
import { Keyboard } from "./helpers/ui";
import { fireEvent, render, waitFor } from "./test-utils";

describe("shortcuts", () => {
  it("Clear canvas shortcut should display confirm dialog", async () => {
    await render(
      <Excalidraw
        initialData={{ elements: [API.createElement({ type: "rectangle" })] }}
        handleKeyboardGlobally
      />,
    );

    expect(window.h.elements.length).toBe(1);

    Keyboard.withModifierKeys({ ctrl: true }, () => {
      Keyboard.keyDown(KEYS.DELETE);
    });
    const confirmDialog = document.querySelector(".confirm-dialog")!;
    expect(confirmDialog).not.toBe(null);

    fireEvent.click(confirmDialog.querySelector('[aria-label="Confirm"]')!);

    await waitFor(() => {
      expect(window.h.elements[0].isDeleted).toBe(true);
    });
  });

  describe("wrapSelectionInFrame shortcut (Ctrl+Shift+F)", () => {
    it("wraps selected non-frame elements in a new frame", async () => {
      const rect = API.createElement({ type: "rectangle", x: 10, y: 10, width: 100, height: 80 });
      await render(
        <Excalidraw
          initialData={{
            elements: [rect],
            appState: { selectedElementIds: { [rect.id]: true } },
          }}
          handleKeyboardGlobally
        />,
      );

      Keyboard.withModifierKeys({ ctrl: true, shift: true }, () => {
        Keyboard.codePress("KeyF");
      });

      await waitFor(() => {
        const nonDeleted = window.h.elements.filter((el) => !el.isDeleted);
        expect(nonDeleted.some((el) => isFrameLikeElement(el))).toBe(true);
      });
    });

    it("shortcutMap exposes a non-empty string for wrapSelectionInFrame", () => {
      const shortcut = getShortcutFromShortcutName("wrapSelectionInFrame");
      expect(shortcut).toBeTruthy();
      expect(shortcut.length).toBeGreaterThan(0);
    });
  });
});
