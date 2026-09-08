import { expect, test } from "@playwright/test";

test("Landing page and local-only Admin sign-in lead to the workspace", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("img", {
      name: "MBWays - Opening Pathways to Opportunities",
    }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Admin workspace", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByLabel("Email").fill("admin@mbways.com");
  await page.locator('input[name="password"]').fill("preview123");
  await page.getByRole("button", { name: "Continue to workspace" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  expect(new URL(page.url()).search).toBe("");
  await expect(page.locator("html")).toHaveClass(/light/u);
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Dashboard" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();

  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/u);
  await page.getByRole("link", { name: "Logout" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("Admin workspace is responsive and routes to the request builder", async ({
  page,
}) => {
  await page.goto("/admin");

  await expect(
    page.getByRole("heading", { name: "Dashboard" }),
  ).toBeVisible();
  await expect(page.getByText("Total profiles")).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/admin\/requests\/new$/, { timeout: 15_000 }),
    page.getByRole("link", { name: "Create request" }).first().click(),
  ]);
});

test("Admin pages do not overflow a 320px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/admin");

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test("Admin data tables support search, pagination, and CSV export", async ({
  page,
}) => {
  await page.goto("/admin/users");
  await expect(
    page.getByRole("table", { name: "Profiles" }),
  ).toBeVisible();
  await expect(page.getByText("Showing 1-5 of 8")).toBeVisible();

  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.getByText("Page 2 of 2")).toBeVisible();

  await page
    .getByRole("searchbox", { name: "Search profiles" })
    .fill("Canada");
  await expect(page.getByText("Kavya Nair")).toBeVisible();
  await expect(page.getByText("Showing 1-1 of 1")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export as CSV" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(
    "documentcollector-demo-profiles.csv",
  );
});
