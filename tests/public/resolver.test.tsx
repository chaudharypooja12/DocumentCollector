import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequestPayload, encodeRequestPayload } from "@/lib/request-link";
import { UserFlow } from "@/modules/user-upload/user-flow";

describe("public request resolver", () => {
  beforeEach(() => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
      "11111111-1111-4111-8111-111111111111",
    );
    window.location.hash = "";
  });

  it("shows a dedicated invalid-link state", async () => {
    window.location.hash = "#request=broken";
    render(<UserFlow />);
    expect(
      await screen.findByRole("heading", { name: "This link is not valid" }),
    ).toBeVisible();
    expect(screen.queryByText(/login|sign up/iu)).not.toBeInTheDocument();
  });

  it("shows a dedicated expired-link state", async () => {
    const payload = createRequestPayload(
      [
        {
          id: "22222222-2222-4222-8222-222222222222",
          name: "Passport",
          type: "SINGLE",
        },
      ],
      1,
      new Date("2020-01-01T00:00:00.000Z"),
    );
    window.location.hash = `#request=${encodeRequestPayload(payload)}`;
    render(<UserFlow />);
    expect(
      await screen.findByRole("heading", { name: "This link has expired" }),
    ).toBeVisible();
  });
});
