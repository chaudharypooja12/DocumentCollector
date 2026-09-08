import { expect, test } from "@playwright/test";

const widths = [320, 360, 375, 390, 412, 430, 768, 820, 1024, 1280, 1440];
const routes = [
  "/",
  "/admin/login",
  "/admin",
  "/admin/templates",
  "/admin/requests/new",
  "/admin/users",
  "/admin/settings",
  "/u#request=invalid",
  "/privacy",
  "/terms",
  "/contact",
];

test("core screens avoid horizontal overflow across the viewport matrix", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "The complete matrix runs once in desktop Chromium.",
  );

  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 600 ? 760 : 900 });
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(
        dimensions.scrollWidth,
        `${route} overflowed at ${width}px`,
      ).toBeLessThanOrEqual(dimensions.clientWidth);
    }
  }
});
