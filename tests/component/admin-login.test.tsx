import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminLogin } from "@/components/admin/admin-login";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("AdminLogin", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("validates locally and navigates without submitting credentials", async () => {
    const user = userEvent.setup();
    render(<AdminLogin />);

    expect(
      screen.getByRole("form", { name: "Admin sign in preview" }),
    ).not.toHaveAttribute("action");
    await user.type(screen.getByLabelText("Email"), "admin@mbways.com");
    await user.type(screen.getByLabelText("Password"), "preview123");
    await user.click(
      screen.getByRole("button", { name: "Continue to workspace" }),
    );

    expect(push).toHaveBeenCalledWith("/admin");
    expect(window.location.search).toBe("");
  });

  it("does not submit when the password visibility button receives Enter", async () => {
    const user = userEvent.setup();
    render(<AdminLogin />);

    await user.type(screen.getByLabelText("Email"), "admin@mbways.com");
    await user.type(screen.getByLabelText("Password"), "preview123");
    screen.getByRole("button", { name: "Show password" }).focus();
    await user.keyboard("{Enter}");

    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Hide password" })).toBeVisible();
  });
});
