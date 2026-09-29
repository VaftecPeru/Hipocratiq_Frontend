import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function loadDoctorClinical(httpClient) {
  const source = readFileSync(new URL("../features/doctors/api/doctor-clinical.ts", import.meta.url), "utf8");
  const loadedModule = { exports: {} };
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;

  runInNewContext(output, {
    AbortController,
    DOMException,
    exports: loadedModule.exports,
    module: loadedModule,
    require(name) {
      if (name === "@/shared/api/http-client") {
        return { ApiError: Error, ...httpClient };
      }
      throw new Error(name);
    },
  });

  return loadedModule.exports;
}

test("imaging client maps studies and preserves PACS linkage", async () => {
  const clinical = loadDoctorClinical({
    getFromApi: async (path) => {
      assert.equal(path, "/api/v1/auth/doctor/imaging");
      return {
        data: [{
          id: 9,
          accession_number: "HIMG-TEST-0001",
          study_instance_uid: "1.2.3.4",
          clinic: { id: 2, name: "Clínica Demo" },
          patient: { id: 7, patient_code: "PAC-7", name: "Paciente Demo" },
          consultation_id: 5,
          modality: "CT",
          study_description: "TAC de tórax",
          status: "available",
          status_label: "Disponible",
          report_summary: "Hallazgos disponibles",
          notes: null,
          ordered_at: "2026-09-29T10:00:00-05:00",
          study_at: "2026-09-29T11:00:00-05:00",
          available_at: "2026-09-29T12:00:00-05:00",
          reviewed_at: null,
          pacs: { linked: true, provider: "pacs-test" },
        }],
        meta: {
          total: 1,
          ordered: 0,
          scheduled: 0,
          available: 1,
          reviewed: 0,
          connection: {
            status: "configured",
            provider: "pacs-test",
            dicomweb: true,
            viewer: true,
          },
        },
      };
    },
    postToApi: async () => { throw new Error("unexpected POST"); },
    patchToApi: async () => { throw new Error("unexpected PATCH"); },
  });

  const result = await clinical.getDoctorImaging();

  assert.equal(result.items[0].accessionNumber, "HIMG-TEST-0001");
  assert.equal(result.items[0].patient.patientCode, "PAC-7");
  assert.equal(result.items[0].pacs.linked, true);
  assert.equal(result.meta.connection.dicomweb, true);
});

test("imaging create and status actions use versioned doctor endpoints", async () => {
  const calls = [];
  const study = {
    id: 10,
    accession_number: "HIMG-TEST-0002",
    study_instance_uid: null,
    clinic: null,
    patient: { id: 8, patient_code: "PAC-8", name: "Paciente Dos" },
    consultation_id: null,
    modality: "MR",
    study_description: "Resonancia",
    status: "ordered",
    status_label: "Solicitado",
    report_summary: null,
    notes: null,
    ordered_at: null,
    study_at: null,
    available_at: null,
    reviewed_at: null,
    pacs: { linked: false, provider: null },
  };

  const clinical = loadDoctorClinical({
    getFromApi: async () => ({ data: [], meta: {} }),
    postToApi: async (path, payload) => {
      calls.push(["post", path, payload]);
      return { data: study };
    },
    patchToApi: async (path, payload) => {
      calls.push(["patch", path, payload]);
      return { data: { ...study, status: "scheduled", status_label: "Programado" } };
    },
  });

  await clinical.createDoctorImagingStudy({
    patient_profile_id: 8,
    modality: "MR",
    study_description: "Resonancia",
  });
  await clinical.updateDoctorImagingStatus(10, "scheduled");

  assert.deepEqual(calls[0], [
    "post",
    "/api/v1/auth/doctor/imaging",
    { patient_profile_id: 8, modality: "MR", study_description: "Resonancia" },
  ]);
  assert.deepEqual(calls[1], [
    "patch",
    "/api/v1/auth/doctor/imaging/10/status",
    { status: "scheduled" },
  ]);
});

test("doctor navigation exposes imaging only after the real page exists", () => {
  const shell = readFileSync(new URL("../features/doctors/ui/doctor-shell.tsx", import.meta.url), "utf8");
  const page = readFileSync(new URL("../app/(doctor)/doctor/imagenologia/page.tsx", import.meta.url), "utf8");

  assert.match(shell, /href: "\/doctor\/imagenologia"[\s\S]*available: true/);
  assert.match(page, /getDoctorImaging/);
  assert.match(page, /createDoctorImagingStudy/);
  assert.match(page, /PACS\/VNA/);
});
