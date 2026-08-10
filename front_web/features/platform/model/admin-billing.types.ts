export type PaymentStatus = "succeeded" | "pending" | "failed" | "refunded";

export type AdminPayment = {
  id: number;
  reference: string;
  clinic: { id: number | null; name: string; countryCode: string | null };
  plan: string | null;
  status: PaymentStatus;
  amountCents: number;
  currency: string;
  provider: string;
  reconciliationNote: string | null;
  refundReference: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
};

export type AdminManualSubscription = {
  id: number;
  clinic: string;
  countryCode: string | null;
  plan: string | null;
};

export type AdminBillingData = {
  payments: AdminPayment[];
  summary: {
    monthlyRevenueCents: number;
    previousMonthRevenueCents: number;
    successfulPayments: number;
    pendingPayments: number;
    failedPayments: number;
    totalRevenueCents: number;
    revenue: Array<{ month: string; amountCents: number }>;
    countries: Array<{ countryCode: string; clinics: number; users: number; revenueCents: number }>;
  };
  filters: { countries: string[]; statuses: PaymentStatus[]; manualSubscriptions: AdminManualSubscription[] };
  pagination: { currentPage: number; from: number | null; lastPage: number; perPage: number; to: number | null; total: number };
};

export type AdminBillingFilters = {
  search?: string;
  country?: string;
  status?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
};
