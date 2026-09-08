import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PaymentLifecycleDemo } from "@/components/admin/payment-lifecycle-demo";
import { PaymentDemoProvider } from "@/providers/payment-demo-provider";

function renderDemo() {
  return render(
    <PaymentDemoProvider>
      <PaymentLifecycleDemo />
    </PaymentDemoProvider>,
  );
}

describe("PaymentLifecycleDemo", () => {
  it("extends an expired fixture and preserves its uploads", async () => {
    const user = userEvent.setup();
    renderDemo();

    expect(screen.getByText("EXPIRED")).toBeVisible();
    expect(screen.getByText("3", { selector: "dd" })).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Extend same link" }),
    );

    expect(screen.getByText("ACTIVE")).toBeVisible();
    expect(screen.getByText(/Existing token extended for 6 hours/u)).toBeVisible();
    expect(screen.getByText(/3 uploads preserved/u)).toBeVisible();
  });

  it("requires confirmation before deleting retained uploads", async () => {
    const user = userEvent.setup();
    renderDemo();

    await user.click(
      screen.getByRole("button", { name: "Delete retained uploads" }),
    );
    expect(
      screen.getByRole("heading", { name: "Delete retained uploads?" }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Delete uploads" }));

    expect(screen.getByText("DELETED")).toBeVisible();
    expect(screen.getByText(/fixture uploads removed/u)).toBeVisible();
  });
});
