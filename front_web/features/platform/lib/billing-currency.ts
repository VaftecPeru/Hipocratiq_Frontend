import type { BillingCurrency } from "@/features/platform/model/admin-billing.types";

export const BILLING_CURRENCIES = ["USD", "MXN", "PEN"] as const satisfies readonly BillingCurrency[];

export const BILLING_CURRENCY_LABELS: Record<BillingCurrency, string> = {
  USD: "Dólares estadounidenses",
  MXN: "Pesos mexicanos",
  PEN: "Soles peruanos",
};

const currencyFormatters: Record<BillingCurrency, Intl.NumberFormat> = {
  USD: new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
  MXN: new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }),
  PEN: new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 }),
};

export function isBillingCurrency(value: unknown): value is BillingCurrency {
  return typeof value === "string" && BILLING_CURRENCIES.includes(value as BillingCurrency);
}

export function formatBillingAmount(amountCents: number, currency: BillingCurrency): string {
  return currencyFormatters[currency].format(amountCents / 100);
}
