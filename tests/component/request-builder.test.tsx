import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { describe, expect, it } from "vitest";
import { RequestBuilder } from "@/components/admin/request-builder";
import { PaymentDemoProvider } from "@/providers/payment-demo-provider";
import {
  TemplatesProvider,
  useTemplates,
} from "@/providers/templates-provider";

function renderBuilder() {
  return render(
    <PaymentDemoProvider>
      <TemplatesProvider>
        <RequestBuilder />
      </TemplatesProvider>
    </PaymentDemoProvider>,
  );
}

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

/** Seeds an oversized template (long document names) so RequestBuilder's
 * generated link exceeds QR/link capacity limits. */
function OversizedTemplateHarness() {
  const { addTemplate } = useTemplates();

  useEffect(() => {
    addTemplate({
      name: "Oversized pack",
      documents: Array.from({ length: 18 }, (_, index) => ({
        id: crypto.randomUUID(),
        name: `${String(index).padStart(2, "0")}-${"a".repeat(70)}`,
        type: "SINGLE" as const,
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <RequestBuilder />;
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

  it("snapshots the UAE demo price into a new request", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(
      screen.getByRole("combobox", { name: "Billing country" }),
    );
    await user.click(
      screen.getByRole("option", {
        name: "United Arab Emirates (Dubai)",
      }),
    );

    expect(
      screen.getByText(
        (content) => content.replace(/\u00A0/gu, " ") === "AED 20.00",
      ),
    ).toBeVisible();
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

    await user.click(screen.getByRole("combobox", { name: "Link expiry" }));
    await user.click(screen.getByRole("option", { name: "5 hours" }));

    expect(screen.queryByText(/\/u#request=/u)).not.toBeInTheDocument();
  });

  it("prompts to create a template when none exist", () => {
    render(
      <PaymentDemoProvider>
        <TemplatesProvider>
          <EmptyTemplatesHarness />
        </TemplatesProvider>
      </PaymentDemoProvider>,
    );
    expect(
      screen.getByText(/No document templates exist yet/u),
    ).toBeVisible();
  });

  it(
    "handles links that exceed QR or encoded-link capacity",
    { timeout: 15000 },
    async () => {
      const user = userEvent.setup();
      render(
        <PaymentDemoProvider>
          <TemplatesProvider>
            <OversizedTemplateHarness />
          </TemplatesProvider>
        </PaymentDemoProvider>,
      );

      await user.click(
        screen.getByRole("combobox", { name: "Document template" }),
      );
      await user.click(
        screen.getByRole("option", { name: "Oversized pack" }),
      );
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
    },
  );
});
