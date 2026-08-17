import { cookies } from "next/headers";
import type { AdminBillingData, AdminBillingFilters, PaymentStatus } from "@/features/platform/model/admin-billing.types";
import { serverEnv } from "@/shared/config/server-env";

type Result = { ok: true; data: AdminBillingData } | { ok: false; message: string };

export function billingQuery(filters: AdminBillingFilters): string {
  const query = new URLSearchParams({ per_page: "15" });
  if (filters.search?.trim()) query.set("search", filters.search.trim());
  if (filters.country) query.set("country_code", filters.country);
  if (filters.status) query.set("status", filters.status);
  if (filters.dateFrom) query.set("date_from", filters.dateFrom);
  if (filters.dateTo) query.set("date_to", filters.dateTo);
  if (filters.page && filters.page > 1) query.set("page", String(filters.page));
  return query.toString();
}

export async function getAdminBilling(filters: AdminBillingFilters): Promise<Result> {
  try {
    const response = await fetch(`${serverEnv.backendUrl}/api/v1/auth/admin/billing?${billingQuery(filters)}`, {
      cache: "no-store",
      headers: { Accept: "application/json", Cookie: (await cookies()).toString(), Origin: serverEnv.appUrl },
    });
    if (!response.ok) return { ok: false, message: response.status === 403 ? "No tienes permiso para consultar facturación." : "No pudimos cargar la facturación." };
    const payload = await response.json() as {
      data: Array<{ id: number; reference: string; clinic: { id: number | null; name: string; country_code: string | null }; plan: string | null; status: PaymentStatus; amount_cents: number; currency: string; provider: string; reconciliation_note: string | null; refund_reference: string | null; paid_at: string | null; refunded_at: string | null; created_at: string }>;
      meta: { current_page: number; from: number | null; last_page: number; per_page: number; to: number | null; total: number };
      summary: { monthly_revenue_cents: number; previous_month_revenue_cents: number; successful_payments: number; pending_payments: number; failed_payments: number; total_revenue_cents: number; revenue: Array<{ month: string; amount_cents: number }>; countries: Array<{ country_code: string; clinics: number; users: number; revenue_cents: number }> };
      filter_options: { countries: string[]; statuses: PaymentStatus[]; manual_subscriptions: Array<{ id: number; clinic: string | null; country_code: string | null; plan: string | null }> };
    };
    if (!Array.isArray(payload.data) || !payload.meta || !payload.summary) return { ok: false, message: "El backend devolvió una respuesta de facturación incompleta." };

    return { ok: true, data: {
      payments: payload.data.map((payment) => ({ id: payment.id, reference: payment.reference, clinic: { id: payment.clinic.id, name: payment.clinic.name, countryCode: payment.clinic.country_code }, plan: payment.plan, status: payment.status, amountCents: payment.amount_cents, currency: payment.currency, provider: payment.provider, reconciliationNote: payment.reconciliation_note, refundReference: payment.refund_reference, paidAt: payment.paid_at, refundedAt: payment.refunded_at, createdAt: payment.created_at })),
      summary: { monthlyRevenueCents: payload.summary.monthly_revenue_cents, previousMonthRevenueCents: payload.summary.previous_month_revenue_cents, successfulPayments: payload.summary.successful_payments, pendingPayments: payload.summary.pending_payments, failedPayments: payload.summary.failed_payments, totalRevenueCents: payload.summary.total_revenue_cents, revenue: payload.summary.revenue.map((item) => ({ month: item.month, amountCents: item.amount_cents })), countries: payload.summary.countries.map((country) => ({ countryCode: country.country_code, clinics: country.clinics, users: country.users, revenueCents: country.revenue_cents })) },
      filters: { countries: payload.filter_options.countries, statuses: payload.filter_options.statuses, manualSubscriptions: payload.filter_options.manual_subscriptions.map((item) => ({ id: item.id, clinic: item.clinic ?? "Clínica eliminada", countryCode: item.country_code, plan: item.plan })) },
      pagination: { currentPage: payload.meta.current_page, from: payload.meta.from, lastPage: payload.meta.last_page, perPage: payload.meta.per_page, to: payload.meta.to, total: payload.meta.total },
    } };
  } catch {
    return { ok: false, message: "No pudimos conectar con el backend de facturación." };
  }
}
