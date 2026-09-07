import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AdminLogin } from "@/components/admin/admin-login";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("AdminLogin", () => {
  it("validates locally and navigates without submitting credentials", async () => {
    const user = userEvent.setup();
    render(<AdminLogin />);

    expect(document.querySelector("form")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Email"), "admin@mbways.com");
    await user.type(screen.getByLabelText("Password"), "preview123");
    await user.click(
      screen.getByRole("button", { name: "Continue to workspace" }),
    );

    expect(push).toHaveBeenCalledWith("/admin");
    expect(window.location.search).toBe("");
  });
});
