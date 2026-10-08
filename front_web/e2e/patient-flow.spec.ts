import { expect, test, type Page } from "@playwright/test";

async function setPatientSession(page: Page) {
  await page.context().addCookies([
    { name: "e2e-role", value: "patient", domain: "127.0.0.1", path: "/" },
    { name: "hipocratiq_e2e_session", value: "active", domain: "127.0.0.1", path: "/" },
  ]);
}


test("patient dashboard follows the Figma navigation hierarchy and keeps clinical shortcuts functional", async ({ page }) => {
  await setPatientSession(page);
  await page.goto("/patient/dashboard", { waitUntil: "networkidle" });

  await expect(page.getByAltText("HIPOCRATIQ")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Bienvenida de nuevo/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Preparar mi cita" })).toHaveAttribute("href", "/patient/triaje");

  await expect(page.getByRole("navigation", { name: "Navegación del paciente" }).getByText("Mi panel")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navegación del paciente" }).getByText("Mis citas")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navegación del paciente" }).getByText("Resultados")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navegación del paciente" }).getByText("Historial clínico")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navegación del paciente" }).getByText("Recetas")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navegación del paciente" }).getByText("IA epidemiológica")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navegación del paciente" }).getByText("Membresía")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navegación del paciente" }).getByText("Mi perfil")).toBeVisible();

  await expect(page.getByText("Mis resultados", { exact: true })).toBeVisible();
  await expect(page.getByText("Mis recetas", { exact: true })).toBeVisible();
  await expect(page.getByText("Mi historial", { exact: true })).toBeVisible();
  await expect(page.getByText("Beta", { exact: true })).toBeVisible();
});

test("patient sidebar collapses on desktop and route transitions show loading and completed states", async ({ page }) => {
  await setPatientSession(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/patient/dashboard", { waitUntil: "networkidle" });

  const shell = page.locator(".patient-shell");
  const sidebar = page.locator(".patient-sidebar");
  const content = page.locator(".patient-content");
  const toggle = page.getByRole("button", { name: "Ocultar menú lateral" });

  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(shell).toHaveClass(/patient-shell--sidebar-collapsed/);
  await expect(page.getByRole("button", { name: "Mostrar menú lateral" })).toBeVisible();

  const [collapsedWidth, collapsedMargin] = await Promise.all([
    sidebar.evaluate((element) => Number.parseFloat(getComputedStyle(element).width)),
    content.evaluate((element) => Number.parseFloat(getComputedStyle(element).marginLeft)),
  ]);
  expect(collapsedWidth).toBeLessThanOrEqual(80);
  expect(Math.abs(collapsedMargin - collapsedWidth)).toBeLessThanOrEqual(2);

  await page.getByRole("button", { name: "Mostrar menú lateral" }).click();
  await expect(shell).not.toHaveClass(/patient-shell--sidebar-collapsed/);

  const citasLink = page.getByRole("navigation", { name: "Navegación del paciente" }).getByRole("link", { name: "Mis citas" });
  await citasLink.click();

  const transition = page.getByTestId("patient-route-transition");
  await expect(transition).toBeVisible();
  await expect(page).toHaveURL(/\/patient\/citas$/);
  await expect(transition.getByText("Completado", { exact: true })).toBeVisible();
  await expect(transition).toBeHidden({ timeout: 2500 });
});

test("patient triage saves a draft and submits the same coherent workflow", async ({ page }) => {
  await setPatientSession(page);
  await page.goto("/patient/triaje", { waitUntil: "networkidle" });

  await expect(page.getByAltText("HIPOCRATIQ")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Prepara tu atención antes de la cita" })).toBeVisible();

  await page.getByRole("button", { name: /III Urgente/i }).click();
  await page.getByLabel(/Motivo de consulta/).fill("Dolor de cabeza moderado desde esta mañana.");
  await page.getByLabel(/Temperatura/).fill("37.2");

  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(page.getByText(/Borrador guardado/).first()).toBeVisible();
  await expect(page.locator(".patient-triage-banner__status").getByText("Borrador", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Enviar preconsulta" }).click();
  await expect(page.getByText(/Preconsulta enviada correctamente/)).toBeVisible();
  await expect(page.locator(".patient-triage-banner__status").getByText("Enviado", { exact: true })).toBeVisible();
  await expect(page.locator(".patient-priority-summary").getByText(/Nivel III/).first()).toBeVisible();
});

test("patient triage blocks improbable vital signs until corrected", async ({ page }) => {
  await setPatientSession(page);
  await page.goto("/patient/triaje", { waitUntil: "networkidle" });

  await page.getByLabel(/Temperatura/).fill("26");
  await page.getByLabel(/Presión sistólica/).fill("100");
  await page.getByLabel(/Presión diastólica/).fill("100");
  await page.getByLabel(/Frecuencia cardiaca/).fill("78");
  await page.getByLabel(/Frecuencia respiratoria/).fill("16");
  await page.getByLabel(/Saturación de oxígeno/).fill("20");

  const alert = page.locator(".patient-vitals-alert");
  await expect(alert).toBeVisible();
  await expect(alert.getByText(/30–45 °C/)).toBeVisible();
  await expect(alert.getByText(/diastólica debe ser menor/i)).toBeVisible();
  await expect(alert.getByText(/70–100%/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Guardar borrador" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Enviar preconsulta" })).toBeDisabled();

  await page.getByLabel(/Temperatura/).fill("36.7");
  await page.getByLabel(/Presión sistólica/).fill("118");
  await page.getByLabel(/Presión diastólica/).fill("76");
  await page.getByLabel(/Saturación de oxígeno/).fill("98");

  await expect(alert).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Guardar borrador" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Enviar preconsulta" })).toBeEnabled();
});

test("patient membership renders real clinic coverage", async ({ page }) => {
  await setPatientSession(page);
  await page.goto("/patient/membresia", { waitUntil: "networkidle" });

  await expect(page.getByText("COBERTURA ACTIVA", { exact: true })).toBeVisible();
  await expect(page.locator(".patient-membership-hero__copy").getByRole("heading", { name: "Professional" })).toBeVisible();
  await expect(page.getByText("Clínica UAT", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Resumen del plan", { exact: true })).toBeVisible();
});

test("patient epidemiology stays private and non-diagnostic", async ({ page }) => {
  await setPatientSession(page);
  await page.goto("/patient/ia", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "IA epidemiológica" }).first()).toBeVisible();
  await expect(page.getByText("Participación desactivada")).toBeVisible();
  await expect(page.getByText(/no sustituye una evaluación médica/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Gestionar consentimiento" })).toHaveAttribute("href", "/patient/perfil");
});


test("all patient Flow 6 routes render without an application error", async ({ page }) => {
  await setPatientSession(page);
  const routes = [
    "/patient/dashboard",
    "/patient/citas",
    "/patient/triaje",
    "/patient/historia-clinica",
    "/patient/resultados",
    "/patient/historial",
    "/patient/recetas",
    "/patient/ia",
    "/patient/membresia",
    "/patient/perfil",
  ];

  for (const route of routes) {
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(new RegExp(route.replaceAll("/", "\\/")));
    await expect(page.getByText("No pudimos cargar esta información. Inténtalo nuevamente.")).toHaveCount(0);
    await expect(page.getByAltText("HIPOCRATIQ")).toBeVisible();
  }
});


test("patient dashboard typography is readable and appointment reminders are responsive", async ({ page }) => {
  await setPatientSession(page);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/patient/dashboard", { waitUntil: "networkidle" });

  const healthCopy = page.locator(".patient-health-status p");
  await expect(healthCopy).toBeVisible();
  const healthFontSize = await healthCopy.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(healthFontSize).toBeGreaterThanOrEqual(10);

  await page.goto("/patient/citas", { waitUntil: "networkidle" });

  const reminders = page.locator(".patient-reminders");
  const reminderGrid = reminders.locator(".patient-reminders__grid");
  await expect(reminders.getByRole("heading", { name: "Antes de tu cita" })).toBeVisible();

  const desktopColumns = await reminderGrid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length);
  expect(desktopColumns).toBe(2);

  for (const reminder of await reminderGrid.locator(".patient-reminder").all()) {
    const fits = await reminder.evaluate((element) => element.scrollWidth <= element.clientWidth + 1);
    expect(fits).toBeTruthy();
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle" });

  const mobileColumns = await reminderGrid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length);
  expect(mobileColumns).toBe(1);

  const remindersFitMobile = await reminders.evaluate((element) => element.scrollWidth <= element.clientWidth + 1);
  expect(remindersFitMobile).toBeTruthy();
});

test("patient internal views expose the premium interaction hierarchy", async ({ page }) => {
  await setPatientSession(page);

  await page.goto("/patient/citas", { waitUntil: "networkidle" });
  await expect(page.getByRole("tab", { name: "Próximas" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Historial" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Canceladas" })).toBeVisible();
  await expect(page.getByText("Teleconsultas", { exact: true })).toBeVisible();
  await expect(page.getByText("Antes de tu cita", { exact: true })).toBeVisible();

  await page.goto("/patient/resultados", { waitUntil: "networkidle" });
  await expect(page.getByText("Estudios", { exact: true })).toBeVisible();
  await expect(page.getByText("Resultado más reciente", { exact: true })).toBeVisible();

  await page.goto("/patient/recetas", { waitUntil: "networkidle" });
  await expect(page.getByText("Activas", { exact: true })).toBeVisible();
  await expect(page.getByText("Uso seguro de medicamentos", { exact: true })).toBeVisible();

  await page.goto("/patient/perfil", { waitUntil: "networkidle" });
  const profileHero = page.locator(".patient-profile-hero");
  await expect(profileHero.getByText("PERFIL DEL PACIENTE", { exact: true })).toBeVisible();
  await expect(profileHero.getByText("Cuenta autenticada", { exact: true })).toBeVisible();

  await page.goto("/patient/triaje", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Prepara tu atención antes de la cita" })).toBeVisible();
  await expect(page.getByText("Nivel orientativo", { exact: true })).toBeVisible();
  await expect(page.getByText("Signos vitales", { exact: true })).toBeVisible();
  await expect(page.getByText("Última actualización", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Nivel III.*Urgente/i })).toBeVisible();

  await page.goto("/patient/historial", { waitUntil: "networkidle" });
  await expect(page.getByText("Resumen clínico", { exact: true })).toBeVisible();
});
