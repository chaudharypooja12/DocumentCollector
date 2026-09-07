import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CameraDialog } from "@/components/capture/camera-dialog";

describe("CameraDialog", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("offers a file fallback when camera access is unavailable", async () => {
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: false,
    });

    render(
      <CameraDialog title="Passport" onAccept={vi.fn()} onClose={vi.fn()} />,
    );

    expect(
      await screen.findByText(/Camera access requires HTTPS/u),
    ).toBeVisible();
    expect(screen.getByText("Choose image")).toBeVisible();
    expect(screen.getByLabelText("Close camera")).toHaveAccessibleName(
      "Close camera",
    );
  });

  it.each([
    ["NotAllowedError", /permission was denied/u],
    ["NotFoundError", /No compatible camera/u],
    ["NotReadableError", /being used by another app/u],
    ["AbortError", /could not start/u],
  ])("surfaces the %s camera state", async (name, message) => {
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi
          .fn()
          .mockRejectedValue(new DOMException("Camera unavailable", name)),
      },
    });

    render(
      <CameraDialog title="Passport" onAccept={vi.fn()} onClose={vi.fn()} />,
    );

    expect(await screen.findByText(message)).toBeVisible();
    expect(screen.getByText("Choose image")).toBeVisible();
  });

  it("stops a camera stream that resolves after the dialog closes", async () => {
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
    });
    const stop = vi.fn();
    const stream = {
      getTracks: () => [{ stop }],
    } as unknown as MediaStream;
    let resolveCamera!: (value: MediaStream) => void;
    const getUserMedia = vi.fn(
      () =>
        new Promise<MediaStream>((resolve) => {
          resolveCamera = resolve;
        }),
    );
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });

    const { unmount } = render(
      <CameraDialog title="Passport" onAccept={vi.fn()} onClose={vi.fn()} />,
    );
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledOnce());
    unmount();
    resolveCamera(stream);

    await waitFor(() => expect(stop).toHaveBeenCalledOnce());
  });
});
