import { expect, test, type Page } from "@playwright/test";

async function setPatientSession(page: Page) {
  await page.context().addCookies([
    { name: "e2e-role", value: "patient", domain: "127.0.0.1", path: "/" },
    { name: "hipocratiq_e2e_session", value: "active", domain: "127.0.0.1", path: "/" },
  ]);
}

test("patient triage saves a draft and submits the same coherent workflow", async ({ page }) => {
  await setPatientSession(page);
  await page.goto("/patient/triaje", { waitUntil: "networkidle" });

  await expect(page.getByAltText("HIPOCRATIQ")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Triaje del paciente" })).toBeVisible();

  await page.getByRole("button", { name: /III Urgente/i }).click();
  await page.getByLabel(/Motivo de consulta/).fill("Dolor de cabeza moderado desde esta mañana.");
  await page.getByLabel("Temperatura (°C)").fill("37.2");

  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(page.getByText(/Borrador guardado/).first()).toBeVisible();
  await expect(page.getByText("Borrador", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Enviar triaje" }).click();
  await expect(page.getByText(/Triaje enviado correctamente/)).toBeVisible();
  await expect(page.getByText("Enviado", { exact: true })).toBeVisible();
  await expect(page.getByText("Nivel III")).toBeVisible();
});

test("patient membership renders real clinic coverage", async ({ page }) => {
  await setPatientSession(page);
  await page.goto("/patient/membresia", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "Tu cobertura HIPOCRATIQ" })).toBeVisible();
  await expect(page.getByText("Professional", { exact: true })).toBeVisible();
  await expect(page.getByText("Clínica UAT", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Agenda", { exact: true })).toBeVisible();
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
