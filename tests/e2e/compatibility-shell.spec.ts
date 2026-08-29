import { expect, test } from "@playwright/test";

test("keeps the shell usable when WebMCP is unavailable", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Desksembly" }),
  ).toBeVisible();
  await expect(
    page.getByText("Agent tools unavailable · manual shell remains", { exact: true }),
  ).toBeVisible();
});
