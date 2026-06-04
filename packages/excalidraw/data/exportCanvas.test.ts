import { IMAGE_MIME_TYPES } from "@excalidraw/common";
import { describe, expect, it, vi } from "vitest";

import { getDefaultAppState } from "../appState";
import { API } from "../tests/helpers/api";

import * as blob from "./blob";
import { fileSave } from "./filesystem";

import { exportCanvas, prepareElementsForExport } from "./index";

import type { AppState } from "../types";

vi.mock("./filesystem", () => ({
  fileSave: vi.fn(() => Promise.resolve(null)),
  nativeFileSystemSupported: false,
}));

const getTestAppState = (): AppState =>
  ({
    ...getDefaultAppState(),
    width: 1000,
    height: 1000,
    offsetTop: 0,
    offsetLeft: 0,
  } as AppState);

describe("exportCanvas", () => {
  it("exports WebP with image/webp MIME type", async () => {
    const elements = [
      API.createElement({
        type: "rectangle",
        width: 100,
        height: 100,
      }),
    ];
    const appState = getTestAppState();
    const { exportedElements } = prepareElementsForExport(
      elements,
      appState,
      false,
    );

    const canvasToBlobSpy = vi
      .spyOn(blob, "canvasToBlob")
      .mockResolvedValue(new Blob(["webp"], { type: IMAGE_MIME_TYPES.webp }));

    vi.mocked(fileSave).mockClear();

    await exportCanvas(
      "webp",
      exportedElements,
      appState,
      {},
      {
        exportBackground: true,
        viewBackgroundColor: "#ffffff",
        exportingFrame: null,
      },
    );

    expect(canvasToBlobSpy).toHaveBeenCalledWith(
      expect.anything(),
      IMAGE_MIME_TYPES.webp,
      0.92,
    );

    expect(fileSave).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        extension: "webp",
        mimeTypes: [IMAGE_MIME_TYPES.webp],
      }),
    );

    const savedBlob = await vi.mocked(fileSave).mock.calls[0][0];
    expect(savedBlob.type).toBe(IMAGE_MIME_TYPES.webp);

    canvasToBlobSpy.mockRestore();
  });

  it("rejects WebP export on empty canvas", async () => {
    const appState = getTestAppState();
    const { exportedElements } = prepareElementsForExport([], appState, false);

    await expect(
      exportCanvas(
        "webp",
        exportedElements,
        appState,
        {},
        {
          exportBackground: true,
          viewBackgroundColor: "#ffffff",
          exportingFrame: null,
        },
      ),
    ).rejects.toThrow();
  });
});
