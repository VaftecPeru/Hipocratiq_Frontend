import { postToApi } from "@/shared/api/http-client";

export type ManualPaymentPayload = {
  subscriptionId: number;
  amount: number;
  currency: string;
  reference: string;
  paidAt: string;
  note?: string;
};

export async function createManualPayment(payload: ManualPaymentPayload): Promise<void> {
  await postToApi("/api/v1/auth/admin/billing/manual-payments", {
    clinic_subscription_id: payload.subscriptionId,
    amount: payload.amount,
    currency: payload.currency,
    reference: payload.reference,
    paid_at: payload.paidAt,
    note: payload.note || null,
  });
}

export async function refundManualPayment(paymentId: number, reference: string, reason: string): Promise<void> {
  await postToApi(`/api/v1/auth/admin/billing/payments/${paymentId}/refund`, { reference, reason });
}
