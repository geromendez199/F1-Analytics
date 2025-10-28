import { expect, test } from "@playwright/test";

test("anchor navigation and locale switch", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation")).toBeVisible();

  await page.getByRole("link", { name: /calendario/i }).click();
  await expect(page).toHaveURL(/#calendario/);

  await page.getByRole("button", { name: "EN" }).click();
  await expect(page).toHaveURL(/lang=en/);
  await expect(page.getByRole("heading", { name: "Schedule" })).toBeVisible();
});
