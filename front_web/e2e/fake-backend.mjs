import http from "node:http";

const port = Number(process.env.PORT ?? 8000);

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

const server = http.createServer((request, response) => {
  const role = cookies(request)["e2e-role"];
  const session = sessionFor(role);

  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");

  if (request.url === "/api/v1/auth/me") {
    if (!session) {
      response.writeHead(401);
      response.end(JSON.stringify({ message: "Unauthenticated." }));
      return;
    }

    response.writeHead(200);
    response.end(JSON.stringify({ success: true, data: session }));
    return;
  }

  response.writeHead(200);
  response.end(JSON.stringify({ success: true, data: {} }));
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`HIPOCRATIQ E2E fake backend listening on ${port}\n`);
});
