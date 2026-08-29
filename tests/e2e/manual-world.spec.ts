import { expect, test } from "@playwright/test";

test("completes the manual miniature-desk workflow with keyboard-safe controls", async ({
  page,
}) => {
  await page.goto("/");

  const accessibleProducts = page.locator(".world-list li");
  await expect(accessibleProducts).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Orange desk lamp.*Locked/i })).toBeVisible();

  await page.getByRole("button", { name: "Place manual sample" }).click();
  await expect(accessibleProducts).toHaveCount(4);

  const display = page.getByRole("button", { name: /Paperframe monitor.*Editable/i });
  await display.focus();
  await display.press("Enter");
  await expect(page.getByTestId("product-inspector")).toContainText("Paperframe monitor");

  await page.getByRole("button", { name: "Lock product" }).click();
  await expect(page.getByTestId("product-inspector")).toContainText("Locked");
  await page.getByRole("button", { name: "Unlock product" }).click();
  await expect(page.getByTestId("product-inspector")).toContainText("Editable");

  await page.getByRole("button", { name: "Move to next anchor" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Moved to display-wide" })).toBeVisible();
  await page.getByRole("button", { name: "Try invalid placement" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Invalid placement" }),
  ).toBeVisible();

  await page.getByRole("button", { name: /QuietType keyboard.*Editable/i }).click();
  await page.getByRole("button", { name: "Remove product" }).click();
  await expect(accessibleProducts).toHaveCount(3);

  await page.setViewportSize({ width: 390, height: 844 });
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
  await expect(
    page.getByRole("img", {
      name: "Isometric miniature desk with directly manipulable products",
    }),
  ).toBeVisible();
});
