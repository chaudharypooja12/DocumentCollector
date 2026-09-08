import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequestBuilder } from "@/components/admin/request-builder";
import { PaymentDemoProvider } from "@/providers/payment-demo-provider";

function renderBuilder() {
  return render(
    <PaymentDemoProvider>
      <RequestBuilder />
    </PaymentDemoProvider>,
  );
}

describe("RequestBuilder", () => {
  beforeEach(() => {
    let sequence = 100;
    vi.spyOn(globalThis.crypto, "randomUUID").mockImplementation(
      () =>
        `00000000-0000-4000-8000-${String(sequence++).padStart(12, "0")}` as `${string}-${string}-${string}-${string}-${string}`,
    );
  });

  it("adds documents and generates a PII-free request URL", async () => {
    const user = userEvent.setup();
    renderBuilder();

    expect(screen.getAllByPlaceholderText("e.g. Passport")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Add document" }));
    const inputs = screen.getAllByPlaceholderText("e.g. Passport");
    expect(inputs).toHaveLength(3);
    await user.type(inputs[2]!, "Residence proof");

    await user.click(
      screen.getByRole("button", { name: "Generate temporary link" }),
    );

    expect(
      await screen.findByText("A new temporary link was generated."),
    ).toBeVisible();
    expect(screen.getByText(/\/u#request=/u)).toBeVisible();
    expect(
      screen.queryByLabelText(/name|phone|email/iu),
    ).not.toBeInTheDocument();
  });

  it("supports touch and keyboard-friendly move controls", async () => {
    const user = userEvent.setup();
    renderBuilder();

    expect(screen.getAllByPlaceholderText("e.g. Passport")[0]).toHaveValue(
      "Passport",
    );
    await user.click(
      screen.getByRole("button", { name: "Move document 1 down" }),
    );

    expect(screen.getAllByPlaceholderText("e.g. Passport")[0]).toHaveValue(
      "Photograph",
    );
    expect(screen.getAllByPlaceholderText("e.g. Passport")[1]).toHaveValue(
      "Passport",
    );
  });

  it("snapshots the UAE demo price into a new request", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(screen.getByRole("combobox", { name: "Billing country" }));
    await user.click(
      screen.getByRole("option", {
        name: "United Arab Emirates (Dubai)",
      }),
    );

    expect(screen.getByText("AED 20.00")).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Generate temporary link" }),
    );
    expect(await screen.findByText(/\/u#request=/u)).toBeVisible();
  });

  it("removes a generated link when its request configuration changes", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(
      screen.getByRole("button", { name: "Generate temporary link" }),
    );
    expect(await screen.findByText(/\/u#request=/u)).toBeVisible();

    await user.type(
      screen.getAllByPlaceholderText("e.g. Passport")[0]!,
      " updated",
    );

    expect(screen.queryByText(/\/u#request=/u)).not.toBeInTheDocument();
    expect(
      screen.queryByText("A new temporary link was generated."),
    ).not.toBeInTheDocument();
  });

  it(
    "handles links that exceed QR or encoded-link capacity",
    { timeout: 15000 },
    async () => {
      const user = userEvent.setup();
      renderBuilder();

      for (let index = 2; index < 20; index += 1) {
        await user.click(screen.getByRole("button", { name: "Add document" }));
      }

      const inputs = screen.getAllByPlaceholderText("e.g. Passport");
      inputs.forEach((input, index) => {
        fireEvent.change(input, {
          target: {
            value: `${String(index).padStart(2, "0")}-${"a".repeat(77)}`,
          },
        });
      });
      await user.click(
        screen.getByRole("button", { name: "Generate temporary link" }),
      );

      expect(
        await screen.findByText(/too long for a reliable QR code/u),
      ).toBeVisible();
      expect(
        screen.queryByLabelText("QR code for temporary document request"),
      ).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Copy" })).toBeVisible();

      inputs.forEach((input, index) => {
        fireEvent.change(input, {
          target: {
            value: `${String(index).padStart(2, "0")}-${"界".repeat(77)}`,
          },
        });
      });
      await user.click(
        screen.getByRole("button", { name: "Generate temporary link" }),
      );

      expect(await screen.findByText(/checklist is too large/u)).toBeVisible();
      expect(
        screen.queryByRole("button", { name: "Copy" }),
      ).not.toBeInTheDocument();
    },
  );
});
