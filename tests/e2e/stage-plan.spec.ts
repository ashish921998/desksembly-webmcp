import { expect, test } from "@playwright/test";

test("animates, cancels, retries, and reduces the starter desk sequence", async ({
  page,
}) => {
  await page.goto("/");
  const replay = page.getByRole("button", { name: "Run labeled deterministic replay" });
  const productItems = page.locator(".world-list li");
  await expect(productItems).toHaveCount(1);

  await replay.click();
  const cancel = page.getByRole("button", { name: "Cancel parcel sequence" });
  await expect(cancel).toBeVisible();
  await expect(page.locator(".activity-ribbon__receipt").first()).toBeVisible();
  await cancel.click();
  await expect(
    page.getByRole("status").filter({ hasText: "Replay cancelled" }),
  ).toBeVisible();
  await expect(productItems).toHaveCount(1);
  await expect(page.locator(".parcel-label")).toHaveCount(0);

  await page.getByRole("button", { name: "Run labeled deterministic replay" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Deterministic replay complete" }),
  ).toBeVisible({ timeout: 12_000 });
  await expect(productItems).toHaveCount(5);
  await expect(page.locator(".activity-ribbon__receipt[data-status='success']")).toHaveCount(4);
  await expect(page.locator(".parcel-label")).toHaveCount(0);

  await page.getByRole("button", { name: "Reset scene" }).click();
  await page.getByRole("button", { name: "Use reduced motion" }).click();
  await expect(page.getByRole("button", { name: "Reduced motion on" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const started = Date.now();
  await page.getByRole("button", { name: "Run labeled deterministic replay" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Deterministic replay complete" }),
  ).toBeVisible({ timeout: 5_000 });
  expect(Date.now() - started).toBeLessThan(2_000);
  await expect(productItems).toHaveCount(5);
});
