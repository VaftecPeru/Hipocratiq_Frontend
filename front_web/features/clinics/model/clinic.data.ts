import type { ClinicsDashboardData } from "@/features/clinics/model/clinic.types";

export const clinicsDashboardData: ClinicsDashboardData = {
  clinics: [
    { id: 1, name: "Clínica del Valle", countryCode: "MX", country: "México", city: "Guadalajara", plan: "professional", users: 64, patients: 9870, status: "active", monthlyBilling: 8900, lastPayment: "14 may 2026" },
    { id: 2, name: "Hospital Central", countryCode: "MX", country: "México", city: "Monterrey", plan: "enterprise", users: 72, patients: 11230, status: "active", monthlyBilling: 11800, lastPayment: "13 may 2026" },
    { id: 3, name: "Clínica Puebla", countryCode: "MX", country: "México", city: "Puebla", plan: "professional", users: 38, patients: 5120, status: "active", monthlyBilling: 5200, lastPayment: "12 may 2026" },
    { id: 4, name: "Centro Médico Sur", countryCode: "MX", country: "México", city: "Ciudad de México", plan: "basic", users: 22, patients: 2750, status: "active", monthlyBilling: 2750, lastPayment: "11 may 2026" },
    { id: 5, name: "Clínica Arequipa", countryCode: "PE", country: "Perú", city: "Arequipa", plan: "enterprise", users: 55, patients: 7890, status: "active", monthlyBilling: 7950, lastPayment: "15 may 2026" },
    { id: 6, name: "Clínica San Pablo", countryCode: "PE", country: "Perú", city: "Lima", plan: "professional", users: 48, patients: 6420, status: "active", monthlyBilling: 6400, lastPayment: "14 may 2026" },
    { id: 7, name: "Clínica Trujillo", countryCode: "PE", country: "Perú", city: "Trujillo", plan: "professional", users: 29, patients: 3860, status: "active", monthlyBilling: 3900, lastPayment: "13 may 2026" },
    { id: 8, name: "Clínica Cusco", countryCode: "PE", country: "Perú", city: "Cusco", plan: "basic", users: 18, patients: 2150, status: "suspended", monthlyBilling: 0, lastPayment: null },
    { id: 9, name: "Clínica Miraflores", countryCode: "PE", country: "Perú", city: "Lima", plan: "basic", users: 15, patients: 1980, status: "suspended", monthlyBilling: 0, lastPayment: null },
    { id: 10, name: "Clínica Santa Rosa", countryCode: "PE", country: "Perú", city: "Piura", plan: "basic", users: 12, patients: 1260, status: "active", monthlyBilling: 1250, lastPayment: "10 may 2026" },
    { id: 11, name: "Clínica San José", countryCode: "MX", country: "México", city: "Mérida", plan: "professional", users: 31, patients: 4210, status: "active", monthlyBilling: 4300, lastPayment: "9 may 2026" },
    { id: 12, name: "Hospital Metropolitano", countryCode: "MX", country: "México", city: "Querétaro", plan: "enterprise", users: 67, patients: 9340, status: "active", monthlyBilling: 9400, lastPayment: "8 may 2026" },
  ],
  totals: {
    clinics: 136,
    activeClinics: 128,
    suspendedClinics: 8,
    users: 8642,
    patients: 312450,
    monthlyRevenue: 342850,
    annualRevenue: 3627540,
  },
  planDistribution: [
    { plan: "enterprise", count: 48, percentage: 35 },
    { plan: "professional", count: 56, percentage: 41 },
    { plan: "basic", count: 32, percentage: 24 },
  ],
  recentActivity: [
    { id: 1, type: "clinic", title: "Nueva clínica", detail: "Clínica San Pablo · Lima", occurredAt: "Hace 32 min" },
    { id: 2, type: "plan", title: "Plan actualizado", detail: "Hospital Central", occurredAt: "Hace 1 hora" },
    { id: 3, type: "payment", title: "Pago recibido", detail: "Clínica San José", occurredAt: "Hace 2 horas" },
    { id: 4, type: "user", title: "Usuario agregado", detail: "María Fernández", occurredAt: "Hace 3 horas" },
    { id: 5, type: "suspension", title: "Clínica suspendida", detail: "Clínica Miraflores", occurredAt: "Hace 1 día" },
  ],
};
