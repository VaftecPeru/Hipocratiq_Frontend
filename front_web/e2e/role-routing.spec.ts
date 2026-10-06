import { expect, test, type Page } from "@playwright/test";

type RoleCase = {
  cookieRole: string;
  expectedPath: string;
};

const landingCases: RoleCase[] = [
  { cookieRole: "super_admin", expectedPath: "/dashboard" },
  { cookieRole: "clinic_admin", expectedPath: "/clinic/dashboard" },
  { cookieRole: "receptionist", expectedPath: "/clinic/dashboard" },
  { cookieRole: "doctor", expectedPath: "/doctor/dashboard" },
  { cookieRole: "independent_doctor", expectedPath: "/doctor/dashboard" },
  { cookieRole: "patient", expectedPath: "/patient/dashboard" },
];

async function setRoleSession(page: Page, role: string) {
  await page.context().addCookies([
    { name: "e2e-role", value: role, domain: "127.0.0.1", path: "/" },
    { name: "hipocratiq_e2e_session", value: "active", domain: "127.0.0.1", path: "/" },
  ]);
}

test("login visual panel keeps the clinical mockup contained and responsive", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  const panel = page.getByTestId("auth-visual-panel");
  const stage = page.getByTestId("auth-visual-stage");
  const image = stage.locator("img");

  await expect(panel).toBeVisible();
  await expect(stage).toBeVisible();
  await expect(image).toBeVisible();

  const objectFit = await image.evaluate((element) => getComputedStyle(element).objectFit);
  expect(objectFit).toBe("contain");

  const noHorizontalOverflow = await panel.evaluate((element) => element.scrollWidth <= element.clientWidth + 1);
  expect(noHorizontalOverflow).toBeTruthy();

  const [panelBox, stageBox] = await Promise.all([panel.boundingBox(), stage.boundingBox()]);
  expect(panelBox).not.toBeNull();
  expect(stageBox).not.toBeNull();
  expect(stageBox!.x).toBeGreaterThanOrEqual(panelBox!.x);
  expect(stageBox!.x + stageBox!.width).toBeLessThanOrEqual(panelBox!.x + panelBox!.width + 1);

  await expect(panel.getByRole("heading", { name: "Seguridad de grado médico" })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle" });
  await expect(panel).toBeHidden();
});

for (const { cookieRole, expectedPath } of landingCases) {
  test(`${cookieRole} lands on ${expectedPath}`, async ({ page }) => {
    await setRoleSession(page, cookieRole);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(new RegExp(`${expectedPath.replaceAll("/", "\\/")}(?:\\?.*)?$`));
  });
}

test("cross-role protected routes return the user to the coherent dashboard", async ({ page }) => {
  const cases = [
    { role: "patient", requested: "/doctor/dashboard", expected: "/patient/dashboard" },
    { role: "doctor", requested: "/clinic/dashboard", expected: "/doctor/dashboard" },
    { role: "receptionist", requested: "/dashboard", expected: "/clinic/dashboard" },
    { role: "super_admin", requested: "/patient/dashboard", expected: "/dashboard" },
  ];

  for (const item of cases) {
    await page.context().clearCookies();
    await setRoleSession(page, item.role);
    await page.goto(item.requested, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(new RegExp(`${item.expected.replaceAll("/", "\\/")}(?:\\?.*)?$`));
  }
});

test("clinic actor without a resolved clinic stops on unauthorized instead of redirect looping", async ({ page }) => {
  await setRoleSession(page, "clinic_admin_no_clinic");
  await page.goto("/clinic/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/unauthorized\?reason=clinic-context-required$/);
});
