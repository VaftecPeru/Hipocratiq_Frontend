import { expect, test } from "@playwright/test";

const visibleRoles = ["administrator", "healthcare", "receptionist", "patient"] as const;

test("login presents four clinical roles and keeps superadmin access separate", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  for (const role of visibleRoles) {
    await expect(page.getByTestId(`login-role-${role}`)).toBeVisible();
  }
  const positions = await Promise.all(visibleRoles.map((role) => page.getByTestId(`login-role-${role}`).boundingBox()));
  expect(positions.every(Boolean)).toBe(true);
  const top = positions[0]!.y;
  expect(positions.every((position) => Math.abs(position!.y - top) < 8)).toBe(true);

  await page.getByRole("link", { name: "Acceso superadministrador" }).click();
  await expect(page).toHaveURL(/role=support/);
  await expect(page.getByTestId("login-role-support")).toHaveAttribute("aria-pressed", "true");
});

for (const viewport of [
  { width: 375, height: 667 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
]) {
  test(`login roles fit viewport ${viewport.width}×${viewport.height} with no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    for (const role of visibleRoles) await expect(page.getByTestId(`login-role-${role}`)).toBeVisible();
    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(horizontalOverflow).toBe(false);
  });
}

test("role changes work with reduced motion without triggering login", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByTestId("login-role-patient").click();
  await expect(page.getByTestId("login-role-patient")).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/\/$/);
});
