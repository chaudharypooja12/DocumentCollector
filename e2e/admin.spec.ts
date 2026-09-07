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
});

test("Admin workspace is responsive and routes to the request builder", async ({
  page,
}) => {
  await page.goto("/admin");

  await expect(
    page.getByRole("heading", {
      name: "Collect documents without the back-and-forth.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Phase 1 demonstration").first()).toBeVisible();
  await page.getByRole("link", { name: "Create request" }).first().click();
  await expect(page).toHaveURL(/\/admin\/requests\/new$/);
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
