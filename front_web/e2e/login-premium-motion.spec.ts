import { expect, test } from "@playwright/test";

const visibleRoles = [
  "support",
  "administrator",
  "healthcare",
  "receptionist",
  "laboratory",
  "patient",
] as const;

test("login shows six accessible roles and superadmin selection without elevating permissions", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  for (const role of visibleRoles) {
    await expect(page.getByTestId(`login-role-${role}`)).toBeVisible();
  }

  const positions = await Promise.all(
    visibleRoles.map((role) => page.getByTestId(`login-role-${role}`).boundingBox()),
  );
  expect(positions.every(Boolean)).toBe(true);
  const top = positions[0]!.y;
  expect(positions.every((position) => Math.abs(position!.y - top) < 8)).toBe(true);

  const superAdmin = page.getByTestId("login-role-support");
  await superAdmin.click();
  await expect(superAdmin).toHaveAttribute("aria-pressed", "true");
  // La organización de laboratorio sigue PENDING y no puede abrir una sesión clínica.
  await expect(page.getByTestId("login-role-laboratory")).toBeDisabled();
});

for (const viewport of [
  { width: 375, height: 667 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
]) {
  test(`login roles fit viewport ${viewport.width}×${viewport.height} with no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("login-role-support")).toBeVisible();
    await expect(page.getByTestId("login-role-patient")).toBeVisible();
    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(horizontalOverflow).toBe(false);
  });
}

test("role changes work with reduced motion and without triggering login", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByTestId("login-role-patient").click();
  await expect(page.getByTestId("login-role-patient")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("login-role-support")).toHaveAttribute("aria-pressed", "false");
  await expect(page).toHaveURL(/\/$/);
});
