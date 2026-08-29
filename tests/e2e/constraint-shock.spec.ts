import { expect, test } from "@playwright/test";

async function stageStarter(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Run labeled deterministic replay" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Deterministic replay complete" }),
  ).toBeVisible({ timeout: 12_000 });
}

test("preserves human edits and replaces only the US constraint conflict", async ({
  page,
}) => {
  await page.goto("/");
  const products = page.locator(".world-list li");
  await stageStarter(page);
  await expect(products).toHaveCount(5);
  const beforeIds = await page
    .locator(".world-list button")
    .evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute("data-merchandise-id")),
    );

  await page.getByRole("button", { name: /QuietType keyboard.*Editable/i }).click();
  await page.getByRole("button", { name: "Lock product" }).click();
  await expect(page.getByRole("button", { name: /QuietType keyboard.*Locked/i })).toBeVisible();

  await page.getByRole("button", { name: "Apply US constraint shock" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "US constraint applied" }),
  ).toBeVisible({ timeout: 10_000 });
  await expect(products).toHaveCount(5);
  await expect(page.getByRole("button", { name: /Felt catchall coaster.*Editable/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Terracotta desk plant/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /QuietType keyboard.*Locked/i })).toBeVisible();
  await expect(page.getByText("90 cm desk", { exact: true })).toBeVisible();
  await expect(page.getByText(/USD 275\.00 \/ 300\.00/)).toBeVisible();
  await expect(page.locator(".activity-ribbon__receipt", { hasText: "Return Terracotta desk plant" })).toBeVisible();
  await expect(page.locator(".activity-ribbon__receipt", { hasText: "Stage Felt catchall coaster" })).toBeVisible();
  const afterIds = await page
    .locator(".world-list button")
    .evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute("data-merchandise-id")),
    );
  expect(afterIds).toEqual(
    expect.arrayContaining(beforeIds.filter((id) => id && !id.endsWith("06"))),
  );
  expect(afterIds).not.toContain(beforeIds.find((id) => id?.endsWith("06")));
  expect(afterIds.some((id) => id?.endsWith("10"))).toBe(true);

  await page.getByRole("button", { name: "Reset scene" }).click();
  await stageStarter(page);
  await page.getByRole("button", { name: /Paperframe monitor.*Editable/i }).click();
  await page.getByRole("button", { name: "Move to next anchor" }).click();
  await page.getByRole("button", { name: "Lock product" }).click();
  await expect(page.getByRole("button", { name: /Paperframe monitor.*display-wide.*Locked/i })).toBeVisible();

  await page.getByRole("button", { name: "Apply US constraint shock" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Paperframe monitor" }),
  ).toContainText(/locked on an anchor/i);
  await expect(page.getByRole("list", { name: "Constraint relaxation suggestions" }).locator("li")).toHaveCount(2);
  await expect(page.getByRole("button", { name: /Terracotta desk plant.*Editable/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Felt catchall coaster/i })).toHaveCount(0);
});
