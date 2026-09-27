import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function loadSource(path, dependencies = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const loadedModule = { exports: {} };
  const output = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
  runInNewContext(output, { AbortController, DOMException, exports: loadedModule.exports, module: loadedModule,
    require(name) { if (name in dependencies) return dependencies[name]; throw new Error(name); },
  });
  return loadedModule.exports;
}
const clinical = loadSource("features/doctors/ui/clinical-sections.ts");
const jsx = (type, props) => ({ type, props });
const { ConsultationForm } = loadSource("features/doctors/ui/consultation-form.tsx", {
  "react/jsx-runtime": { jsx, jsxs: jsx }, react: { useState: (initial) => [initial, () => {}] },
  "lucide-react": { FileText: "icon", Save: "icon", X: "icon" },
  "@/features/doctors/ui/doctor-primitives": { DoctorCard: "card" },
  "@/shared/ui/spinner": { Spinner: "spinner" },
  "@/features/doctors/ui/clinical-sections": clinical,
});
function nodes(node) {
  if (Array.isArray(node)) return node.flatMap(nodes);
  if (!node || typeof node !== "object") return [];
  return [node, ...nodes(node.props?.children)];
}
for (const [status, expected] of Object.entries({
  draft: ["in_progress", "draft", "completed", "canceled"],
  in_progress: ["in_progress", "completed", "canceled"],
  completed: ["completed", "signed"], signed: ["signed"], canceled: ["canceled"],
})) {
  test(`consultation ${status} exposes only valid transitions`, () => {
    let submissions = 0;
    const form = ConsultationForm({ mode: "edit", patientLabel: "Paciente de prueba", pending: false,
      serverError: null, initialValues: { status, chiefComplaint: "Consulta de prueba" },
      onSubmit: () => submissions++, onCancel: () => {},
    });
    const all = nodes(form);
    assert.deepEqual(all.filter((node) => node.type === "option").map((node) => node.props.value), expected);
    if (["signed", "canceled"].includes(status)) {
      assert.equal(all.find((node) => node.type === "fieldset").props.disabled, true);
      form.props.onSubmit({ preventDefault() {} });
      assert.equal(submissions, 0);
    }
  });
}
test("pending save disables form and prevents another submission", () => {
  let submissions = 0;
  const form = ConsultationForm({ mode: "create", patientLabel: "Paciente", pending: true,
    initialValues: { chiefComplaint: "Consulta de prueba" }, serverError: null,
    onSubmit: () => submissions++, onCancel: () => {},
  });
  assert.equal(nodes(form).find((node) => node.type === "fieldset").props.disabled, true);
  form.props.onSubmit({ preventDefault() {} });
  assert.equal(submissions, 0);
});
test("existing fifteen-section form remains intact", () => {
  assert.equal(clinical.CLINICAL_SECTIONS.length, 15);
  assert.equal(new Set(clinical.CLINICAL_SECTIONS.map((section) => section.key)).size, 15);
});

test("navigation hides the prior encounter while loading and clears it on success or error", async () => {
  const state = [];
  let cursor = 0;
  let previousDependencies;
  let effect;
  let params = new URLSearchParams("patient_id=1&appointment_id=10");
  let fail = false;
  const existing = { id: 100, patient: { id: 1, name: "Paciente A" }, appointmentId: 10, status: "in_progress" };
  const { default: Page } = loadSource("app/(doctor)/doctor/consultas/page.tsx", {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    react: {
      useState(initial) {
        const index = cursor++;
        if (!(index in state)) state[index] = initial;
        return [state[index], (value) => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
      },
      useMemo: (fn) => fn(),
      useEffect(fn, dependencies) {
        if (JSON.stringify(dependencies) !== JSON.stringify(previousDependencies)) {
          effect = fn;
          previousDependencies = dependencies;
        }
      },
    },
    "next/navigation": { useSearchParams: () => params },
    "lucide-react": {},
    "@/features/doctors/ui/doctor-primitives": {
      DoctorAvatar: "avatar", DoctorCard: "card", MetricCard: "metric",
      SectionHeading: "heading", StatusBadge: "status",
    },
    "@/features/doctors/ui/consultation-form": { ConsultationForm: "form-component" },
    "@/features/doctors/ui/clinical-sections": clinical,
    "@/features/doctors/api/doctor-clinical": {
      getDoctorPatients: async () => {
        if (fail) throw new Error("Error de carga");
        return [{ id: 1, name: "Paciente A" }, { id: 2, name: "Paciente B" }];
      },
      getDoctorConsultations: async () => [existing],
      consultationToPayload: () => ({ chief_complaint: "Registro anterior A", status: "in_progress" }),
    },
    "@/shared/ui/spinner": { Spinner: "spinner" },
    "@/shared/i18n/runtime-locale": { getClientLocale: () => "es" },
  });
  const render = () => { cursor = 0; return Page(); };
  const settle = async () => { effect(); await new Promise(setImmediate); };
  render();
  await settle();
  let page = render();
  assert.equal(nodes(page).find((node) => node.type === "form-component").props.mode, "edit");

  params = new URLSearchParams("patient_id=2&appointment_id=20");
  page = render();
  assert.equal(nodes(page).some((node) => node.type === "form-component"), false);
  await settle();
  page = render();
  const form = nodes(page).find((node) => node.type === "form-component");
  assert.equal(form.props.mode, "create");
  assert.equal(form.props.patientLabel, "Paciente: Paciente B");
  assert.equal(form.props.initialValues.chiefComplaint, undefined);

  fail = true;
  params = new URLSearchParams("patient_id=3&appointment_id=30");
  render();
  await settle();
  page = render();
  assert.equal(nodes(page).some((node) => node.type === "form-component"), false);
});
