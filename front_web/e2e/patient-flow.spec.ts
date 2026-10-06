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
  await expect(page.getByText("Borrador", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Enviar preconsulta" }).click();
  await expect(page.getByText(/Preconsulta enviada correctamente/)).toBeVisible();
  await expect(page.getByText("Enviado", { exact: true })).toBeVisible();
  await expect(page.getByText("Nivel III")).toBeVisible();
});

test("patient membership renders real clinic coverage", async ({ page }) => {
  await setPatientSession(page);
  await page.goto("/patient/membresia", { waitUntil: "networkidle" });

  await expect(page.getByText("COBERTURA ACTIVA", { exact: true })).toBeVisible();
  await expect(page.getByText("Professional", { exact: true })).toBeVisible();
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
