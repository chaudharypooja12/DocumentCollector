import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TemplateBuilderForm } from "@/components/admin/template-builder";

function renderForm(onSubmit = vi.fn()) {
  render(
    <>
      <TemplateBuilderForm formId="test-template-form" onSubmit={onSubmit} />
      <button type="submit" form="test-template-form">
        Save template
      </button>
    </>,
  );
  return onSubmit;
}

describe("TemplateBuilderForm", () => {
  it("adds and reorders documents before submitting the built template", async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();

    await user.type(screen.getByLabelText("Template name"), "Visa pack");
    await user.type(
      screen.getByPlaceholderText("e.g. Passport"),
      "Passport",
    );

    await user.click(screen.getByRole("button", { name: "Add document" }));
    const inputs = screen.getAllByPlaceholderText("e.g. Passport");
    expect(inputs).toHaveLength(2);
    await user.type(inputs[1]!, "Photograph");

    await user.click(
      screen.getByRole("button", { name: "Move document 1 down" }),
    );
    expect(screen.getAllByPlaceholderText("e.g. Passport")[0]).toHaveValue(
      "Photograph",
    );
    expect(screen.getAllByPlaceholderText("e.g. Passport")[1]).toHaveValue(
      "Passport",
    );

    await user.click(screen.getByRole("button", { name: "Save template" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Visa pack",
      documents: [
        expect.objectContaining({ name: "Photograph", type: "SINGLE" }),
        expect.objectContaining({ name: "Passport", type: "SINGLE" }),
      ],
    });
  });

  it("blocks submission when two documents share a name", async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();

    await user.type(screen.getByLabelText("Template name"), "Duplicate test");
    await user.type(
      screen.getByPlaceholderText("e.g. Passport"),
      "Passport",
    );
    await user.click(screen.getByRole("button", { name: "Add document" }));
    const inputs = screen.getAllByPlaceholderText("e.g. Passport");
    await user.type(inputs[1]!, "Passport");

    await user.click(screen.getByRole("button", { name: "Save template" }));

    expect(
      await screen.findByText("Document names must be unique"),
    ).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
