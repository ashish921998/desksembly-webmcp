import { expect, test } from "@playwright/test";

async function stageStarter(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Run labeled deterministic replay" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Deterministic replay complete" }),
  ).toBeVisible({ timeout: 12_000 });
}

test("reviews once, handles partial failure, and reconciles the fallback cart", async ({
  page,
}) => {
  await page.goto("/");
  await stageStarter(page);

  const reviewPanel = page.getByRole("region", {
    name: "Approve the deterministic kit once.",
  });
  await reviewPanel.getByRole("button", { name: "Prepare exact review" }).click();
  await expect(reviewPanel.locator(".scene-review__lines li")).toHaveCount(5);
  await expect(reviewPanel.getByText(/Total USD 278\.00/)).toBeVisible();

  await reviewPanel.getByRole("button", { name: "Simulate price change" }).click();
  await expect(
    reviewPanel.getByRole("alert").filter({ hasText: "Scene or price changed" }),
  ).toBeVisible();
  await expect(
    reviewPanel.getByRole("button", { name: "Approve exact deterministic kit" }),
  ).toBeDisabled();

  await reviewPanel.getByRole("button", { name: "Prepare exact review" }).click();
  await expect(reviewPanel.getByText(/Total USD 284\.00/)).toBeVisible();
  await reviewPanel.getByLabel("Simulate one rejected line").check();
  await reviewPanel.getByRole("button", { name: "Approve exact deterministic kit" }).click();
  await expect(
    reviewPanel.getByRole("status").filter({ hasText: "Partial deterministic cart result" }),
  ).toBeVisible({ timeout: 8_000 });
  await expect(
    reviewPanel.getByRole("list", { name: "Rejected cart lines" }),
  ).toContainText("Pebble speaker");
  await expect(
    reviewPanel.getByRole("button", {
      name: "Shopify Checkout unavailable · connect a development store",
    }),
  ).toBeDisabled();
  await expect(
    page.locator(".activity-ribbon__receipt", { hasText: "Cart Pebble speaker" }),
  ).toHaveCount(0);

  await reviewPanel.getByRole("button", { name: "Repeat consumed approval" }).click();
  await expect(
    reviewPanel.getByRole("status").filter({ hasText: "REVIEW_REQUIRED" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Reset scene" }).click();
  await stageStarter(page);
  await reviewPanel.getByLabel("Simulate one rejected line").uncheck();
  await reviewPanel.getByRole("button", { name: "Prepare exact review" }).click();
  await reviewPanel.getByRole("button", { name: "Approve exact deterministic kit" }).click();
  await expect(
    reviewPanel.getByRole("status").filter({ hasText: "Exact deterministic cart reconciled" }),
  ).toBeVisible({ timeout: 8_000 });
  await expect(reviewPanel.locator(".scene-review__cart > ul:not(.scene-review__rejected) li")).toHaveCount(6);
  await expect(reviewPanel.getByText("Walnut headphone stand", { exact: true })).toBeVisible();
  await expect(reviewPanel.getByText(/Total USD 307\.00/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Paperframe monitor.*Carted/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Orange desk lamp.*Carted/i })).toBeVisible();
});
