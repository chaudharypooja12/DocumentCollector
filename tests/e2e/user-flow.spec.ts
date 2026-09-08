import { expect, test } from "@playwright/test";

test("Admin link opens the no-login capture and PDF flow", async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto("/admin/requests/new");
  await page.getByRole("button", { name: "Generate temporary link" }).click();
  const requestUrl = await page.locator("p.break-all").textContent();
  expect(requestUrl).toContain("/u#request=");

  const dataUrl = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 320;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    context.fillStyle = "#f7f2e8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#20242c";
    context.font = "28px sans-serif";
    context.fillText("Document capture fixture", 45, 165);
    return canvas.toDataURL("image/png");
  });
  const image = Buffer.from(dataUrl.split(",")[1]!, "base64");

  await page.goto(requestUrl!);
  await expect(
    page.getByRole("heading", { name: "Basic details" }),
  ).toBeVisible();
  await expect(page.getByText(/login|sign up/iu)).toHaveCount(0);

  await page.getByLabel("Full name").fill("Priya Sharma");
  await page.getByLabel("Age").fill("24");
  await page.getByRole("combobox", { name: /gender/iu }).click();
  await page.getByRole("option", { name: "Female" }).click();
  await page.getByLabel("Phone number").fill("+91 98765 43210");
  await page
    .getByLabel("Permanent address", { exact: true })
    .fill("12 MG Road, Pune, Maharashtra");
  await page
    .getByRole("checkbox", { name: /same as my permanent address/iu })
    .click();

  const captureButtons = page.getByRole("button", {
    name: /^Capture (document|front|back)$/iu,
  });
  // The camera dialog now auto-advances to the next required side (e.g.
  // front -> back of the same document) without closing, so a new "Capture"
  // button only reappears once the dialog closes for a fully captured
  // document group.
  while ((await captureButtons.count()) > 0) {
    await captureButtons.first().click();
    await page.locator('input[type="file"]').setInputFiles({
      name: "document.png",
      mimeType: "image/png",
      buffer: image,
    });
    await page.getByRole("button", { name: "Use photo" }).click();
    while ((await page.getByRole("dialog").count()) > 0) {
      await page.locator('input[type="file"]').setInputFiles({
        name: "document.png",
        mimeType: "image/png",
        buffer: image,
      });
      await page.getByRole("button", { name: "Use photo" }).click();
    }
  }

  await page
    .getByRole("button", { name: /Continue to pay/iu })
    .click();
  await page.getByRole("button", { name: "Open mock checkout" }).click();
  await page.getByRole("button", { name: "Cancel checkout" }).click();
  await expect(page.getByText(/captures are still available/iu)).toBeVisible();
  await page
    .getByRole("button", { name: "Retry demo payment" })
    .click();
  await page.getByRole("button", { name: "Open mock checkout" }).click();
  await page
    .getByRole("button", { name: "Simulate successful payment" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Documents are ready." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Download PDF" }),
  ).toHaveAttribute("download", "Complete_Documents.pdf");
  await expect(page.getByText(/tab is now locked/iu)).toBeVisible();
});

test("Invalid links render a dedicated state without account prompts", async ({
  page,
}) => {
  await page.goto("/u#request=broken");
  await expect(
    page.getByRole("heading", { name: "This link is not valid" }),
  ).toBeVisible();
  await expect(page.getByText(/login|sign up|account/iu)).toHaveCount(0);
});
