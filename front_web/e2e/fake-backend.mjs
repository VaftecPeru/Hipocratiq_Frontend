import http from "node:http";

const port = Number(process.env.PORT ?? 8000);
const host = process.env.HOST ?? "0.0.0.0";

function cookies(request) {
  return Object.fromEntries(
    String(request.headers.cookie ?? "")
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf("=");
        return index === -1
          ? [item, ""]
          : [item.slice(0, index), decodeURIComponent(item.slice(index + 1))];
      }),
  );
}

function sessionFor(role) {
  const baseUser = {
    id: 100,
    name: "Usuario UAT",
    email: role ? `${role}@hipocratiq.test` : null,
    phone_number: "+525500000000",
    country_code: "MX",
    status: "active",
    onboarding_status: "completed",
    roles: [],
    is_global: false,
    clinic: null,
    doctor: null,
    patient: null,
  };

  switch (role) {
    case "super_admin":
      return {
        actor_context: "staff",
        client_type: "web",
        user: { ...baseUser, roles: ["super_admin"], is_global: true },
      };
    case "clinic_admin":
      return {
        actor_context: "clinic_admin",
        client_type: "web",
        user: {
          ...baseUser,
          roles: ["clinic_admin"],
          clinic: { id: 10, name: "Clínica UAT", plan: "professional", status: "active" },
        },
      };
    case "clinic_admin_no_clinic":
      return {
        actor_context: "clinic_admin",
        client_type: "web",
        user: { ...baseUser, roles: ["clinic_admin"], clinic: null },
      };
    case "receptionist":
      return {
        actor_context: "receptionist",
        client_type: "web",
        user: {
          ...baseUser,
          roles: ["receptionist"],
          clinic: { id: 10, name: "Clínica UAT", plan: "professional", status: "active" },
        },
      };
    case "doctor":
      return {
        actor_context: "doctor",
        client_type: "web",
        user: {
          ...baseUser,
          roles: ["doctor"],
          doctor: {
            medical_license: "90000001",
            specialty: "Medicina general",
            practice_type: "clinic",
            clinic: { id: 10, name: "Clínica UAT" },
            plan: "professional",
          },
        },
      };
    case "independent_doctor":
      return {
        actor_context: "doctor",
        client_type: "web",
        user: {
          ...baseUser,
          roles: ["doctor"],
          doctor: {
            medical_license: "90000002",
            specialty: "Medicina general",
            practice_type: "independent",
            clinic: null,
            plan: "professional",
          },
        },
      };
    case "patient":
      return {
        actor_context: "patient",
        client_type: "web",
        user: {
          ...baseUser,
          roles: [],
          patient: {
            clinic: { id: 10, name: "Clínica UAT" },
            plan: "professional",
          },
        },
      };
    default:
      return null;
  }
}


let patientTriage = null;

const patientProfile = {
  id: 501,
  patient_code: "PAC-UAT-001",
  name: "Paciente UAT",
  email: "patient@hipocratiq.test",
  phone_number: "+525500000000",
  country_code: "MX",
  status: "active",
  document_type: "CURP",
  document_number: "UAT000000TEST",
  date_of_birth: "1990-01-15",
  sex: "Otro",
  address: "Dirección UAT",
  emergency_contact: "+525500000001",
  insurance: "Cobertura UAT",
  whatsapp_consent: true,
  created_at: "2026-01-01T00:00:00Z",
  clinic: { id: 10, name: "Clínica UAT" },
};

const patientMembership = {
  available: true,
  source: "clinic",
  clinic: { id: 10, name: "Clínica UAT" },
  plan: {
    id: 20,
    key: "professional",
    name: "Professional",
    description: "Cobertura integral de la clínica.",
    currency: "USD",
    monthly_price_cents: 14900,
    annual_price_cents: 149000,
    features: ["Agenda", "Expediente clínico", "Resultados"],
  },
  subscription: {
    status: "active",
    billing_cycle: "monthly",
    auto_renew: true,
    starts_at: "2026-01-01T00:00:00Z",
    ends_at: "2027-01-01T00:00:00Z",
  },
  latest_payment: { amount_cents: 14900, currency: "USD", paid_at: "2026-10-01T12:00:00Z" },
  message: "Tu acceso está cubierto por la membresía activa de tu clínica.",
};

const patientEpidemiology = {
  available: true,
  generated_at: "2026-10-05T06:00:00Z",
  period: { from: "2026-07-07", to: "2026-10-05", days: 90 },
  participation: { consent_active: false, policy_version: null, scope: "epidemiology_anonymized" },
  metrics: {
    appointments: 3,
    consultations: 2,
    laboratory_orders: 2,
    available_results: 1,
    prescriptions: 2,
    active_prescriptions: 1,
  },
  trend: [
    { month: "2026-08", label: "08/2026", appointments: 1, consultations: 0, laboratory_orders: 0 },
    { month: "2026-09", label: "09/2026", appointments: 1, consultations: 1, laboratory_orders: 1 },
    { month: "2026-10", label: "10/2026", appointments: 1, consultations: 1, laboratory_orders: 1 },
  ],
  message: "Tu actividad clínica se muestra de forma privada.",
  disclaimer: "Esta vista resume tu actividad registrada y no sustituye una evaluación médica.",
};

async function jsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
}

function json(response, status, payload) {
  response.writeHead(status);
  response.end(JSON.stringify(payload));
}

const server = http.createServer(async (request, response) => {
  const role = cookies(request)["e2e-role"];
  const session = sessionFor(role);
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;

  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");

  if (pathname === "/api/v1/auth/me") {
    if (!session) {
      response.writeHead(401);
      response.end(JSON.stringify({ message: "Unauthenticated." }));
      return;
    }

    response.writeHead(200);
    response.end(JSON.stringify({ success: true, data: session }));
    return;
  }

  if (role === "patient") {
    if (request.method === "GET" && pathname === "/api/v1/auth/patient/profile") {
      json(response, 200, { success: true, data: patientProfile });
      return;
    }
    if (request.method === "GET" && pathname === "/api/v1/auth/patient/appointments") {
      json(response, 200, { success: true, data: [] });
      return;
    }
    if (request.method === "GET" && pathname === "/api/v1/auth/patient/history") {
      json(response, 200, { success: true, data: [] });
      return;
    }
    if (request.method === "GET" && pathname === "/api/v1/auth/patient/prescriptions") {
      json(response, 200, { success: true, data: [] });
      return;
    }
    if (request.method === "GET" && pathname === "/api/v1/auth/patient/results") {
      json(response, 200, { success: true, data: [] });
      return;
    }
    if (request.method === "GET" && pathname === "/api/v1/auth/patient/triage") {
      json(response, 200, { success: true, data: patientTriage });
      return;
    }
    if (request.method === "POST" && pathname === "/api/v1/auth/patient/triage") {
      const payload = await jsonBody(request);
      patientTriage = {
        id: 700,
        reason: payload.reason,
        temperature_c: payload.temperature_c ?? null,
        systolic_bp: payload.systolic_bp ?? null,
        diastolic_bp: payload.diastolic_bp ?? null,
        heart_rate: payload.heart_rate ?? null,
        respiratory_rate: payload.respiratory_rate ?? null,
        oxygen_saturation: payload.oxygen_saturation ?? null,
        triage_priority: ["I", "II"].includes(payload.triage_level) ? "emergency" : payload.triage_level === "III" ? "urgent" : "routine",
        triage_level: payload.triage_level,
        triage_status: payload.triage_status,
        submitted_at: payload.triage_status === "submitted" ? "2026-10-05T06:10:00Z" : null,
        triage_notes: payload.triage_notes ?? null,
        recorded_at: "2026-10-05T06:05:00Z",
        clinic: { id: 10, name: "Clínica UAT" },
        recorded_by: { id: 100, name: "Paciente UAT" },
      };
      json(response, 200, { success: true, data: patientTriage, meta: { next_step: payload.triage_status === "submitted" ? "submitted" : "draft_saved" } });
      return;
    }
    if (request.method === "GET" && pathname === "/api/v1/auth/patient/membership") {
      json(response, 200, { success: true, data: patientMembership });
      return;
    }
    if (request.method === "GET" && pathname === "/api/v1/auth/patient/epidemiology") {
      json(response, 200, { success: true, data: patientEpidemiology });
      return;
    }
    if (request.method === "GET" && pathname === "/api/v1/auth/patient/consents") {
      json(response, 200, { success: true, data: [], meta: { policy_version: "2026-10" } });
      return;
    }
  }

  response.writeHead(200);
  response.end(JSON.stringify({ success: true, data: {} }));
});

server.listen(port, host, () => {
  process.stdout.write(`HIPOCRATIQ E2E fake backend listening on ${host}:${port}\n`);
});
