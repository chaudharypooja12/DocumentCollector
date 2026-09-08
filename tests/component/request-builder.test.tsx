import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { describe, expect, it } from "vitest";
import { RequestBuilder } from "@/components/admin/request-builder";
import {
  TemplatesProvider,
  useTemplates,
} from "@/providers/templates-provider";

function renderBuilder() {
  render(
    <TemplatesProvider>
      <RequestBuilder />
    </TemplatesProvider>,
  );
}

describe("RequestBuilder", () => {
  it("generates a PII-free request URL from the default template", async () => {
    const user = userEvent.setup();
    renderBuilder();

    expect(screen.getByText("Passport (Front + Back)")).toBeVisible();
    expect(screen.getByText("Photograph")).toBeVisible();

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

  it("removes a generated link when the expiry changes", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(
      screen.getByRole("button", { name: "Generate temporary link" }),
    );
    expect(await screen.findByText(/\/u#request=/u)).toBeVisible();

    await user.click(screen.getByRole("combobox", { name: /hours?/iu }));
    await user.click(screen.getByRole("option", { name: "5 hours" }));

    expect(screen.queryByText(/\/u#request=/u)).not.toBeInTheDocument();
  });

  it("prompts to create a template when none exist", () => {
    render(
      <TemplatesProvider>
        <EmptyTemplatesHarness />
      </TemplatesProvider>,
    );
    expect(
      screen.getByText(/No document templates exist yet/u),
    ).toBeVisible();
  });
});

/** Clears the provider's seeded default template so RequestBuilder renders
 * its empty-state prompt instead. */
function EmptyTemplatesHarness() {
  const { templates, removeTemplate } = useTemplates();

  useEffect(() => {
    templates.forEach((template) => removeTemplate(template.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (templates.length > 0) return null;
  return <RequestBuilder />;
}
