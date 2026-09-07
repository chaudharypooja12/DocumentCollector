import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AdminShell } from "@/components/admin/admin-shell";
import { BrandLockup } from "@/components/shared/brand-lockup";
import { ThemeProvider } from "@/providers/theme-provider";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
}));

describe("theme and Admin shell", () => {
  it("renders the canonical logo without a nested logo.svg request", () => {
    render(<BrandLockup href="/" />);

    expect(
      screen.getByRole("img", {
        name: "MBWays - Opening Pathways to Opportunities",
      }),
    ).toBeVisible();
    expect(document.querySelector('img[src="/brand/logo.svg"]')).toBeNull();
    expect(
      document.querySelector('image[href="/brand/logo-orange-layer.png"]'),
    ).not.toBeNull();
  });

  it("defaults to Light and toggles Dark in memory", async () => {
    const user = userEvent.setup();
    document.documentElement.className = "light";
    render(
      <ThemeProvider>
        <AdminShell>
          <p>Workspace content</p>
        </AdminShell>
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveClass("light");
    expect(screen.getByRole("link", { name: /Logout/u })).toHaveAttribute(
      "href",
      "/admin/login",
    );
    expect(
      screen
        .getAllByText("Dashboard")
        .some((element) => element.closest("header")),
    ).toBe(true);

    await user.click(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    );
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
    expect(document.documentElement).not.toHaveClass("light");
  });
});
