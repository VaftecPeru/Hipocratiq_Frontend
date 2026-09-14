"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, RotateCcw } from "lucide-react";
import { createManualPayment, refundManualPayment } from "@/features/platform/api/browser-billing";
import type { AdminManualSubscription, AdminPayment } from "@/features/platform/model/admin-billing.types";
import { Modal } from "@/shared/ui/modal";
import { ModalField, ModalGrid, ModalPrimaryButton, ModalSecondaryButton, ModalSelect, ModalTextarea } from "@/shared/ui/modal-parts";

function ErrorNote({ message }: { message: string | null }) {
  return message ? <p className="rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-2xs text-danger" role="alert">{message}</p> : null;
}

function localDateTimeValue(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export function NewManualPaymentButton({ subscriptions }: { subscriptions: AdminManualSubscription[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState(String(subscriptions[0]?.id ?? ""));
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [reference, setReference] = useState("");
  const [paidAt, setPaidAt] = useState(localDateTimeValue);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSubscriptionId = subscriptions.some((subscription) => String(subscription.id) === subscriptionId)
    ? subscriptionId
    : String(subscriptions[0]?.id ?? "");

  const close = (force = false) => {
    if (isLoading && !force) return;
    setIsOpen(false);
    setError(null);
    setAmount("");
    setCurrency("USD");
    setReference("");
    setPaidAt(localDateTimeValue());
    setNote("");
  };

  const submit = async () => {
    const parsedAmount = Number(amount);
    if (!selectedSubscriptionId || !Number.isFinite(parsedAmount) || parsedAmount <= 0 || !reference.trim() || !paidAt) {
      setError("Completa la suscripción, monto, referencia y fecha del cobro.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await createManualPayment({
         subscriptionId: Number(selectedSubscriptionId),
        amount: parsedAmount,
        currency,
        reference: reference.trim(),
        paidAt: new Date(paidAt).toISOString(),
        note: note.trim(),
      });
       close(true);
       router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos registrar el pago.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
       <button className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 text-xs font-bold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50" disabled={!subscriptions.length} onClick={() => { setError(null); setIsOpen(true); }} title={!subscriptions.length ? "No hay suscripciones manuales activas" : undefined} type="button">
        <Banknote className="size-3.5" aria-hidden="true" />Registrar pago
      </button>
       <Modal isOpen={isOpen} onClose={close} title="Registrar pago manual" description="Conciliación para una suscripción creada manualmente por administración." footer={<><ModalSecondaryButton onClick={close}>Cancelar</ModalSecondaryButton><ModalPrimaryButton disabled={isLoading} onClick={submit}>{isLoading ? "Registrando..." : "Registrar pago"}</ModalPrimaryButton></>}>
        <div className="space-y-4">
          <ErrorNote message={error} />
           <ModalSelect id="manual-subscription" label="Suscripción" required value={selectedSubscriptionId} onChange={setSubscriptionId} options={subscriptions.map((item) => ({ value: String(item.id), label: `${item.clinic} · ${item.plan ?? "Sin plan"} · ${item.countryCode ?? "—"}` }))} />
          <ModalGrid>
            <ModalField id="manual-amount" label="Monto" min={0.01} required step={0.01} type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
            <ModalSelect id="manual-currency" label="Moneda" required value={currency} onChange={setCurrency} options={["USD", "MXN", "PEN"]} />
          </ModalGrid>
          <ModalGrid>
            <ModalField id="manual-reference" label="Referencia bancaria" required value={reference} onChange={(event) => setReference(event.target.value)} />
            <ModalField id="manual-paid-at" label="Fecha y hora del pago" required type="datetime-local" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} />
          </ModalGrid>
          <ModalTextarea id="manual-note" label="Nota de conciliación" rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
        </div>
      </Modal>
    </>
  );
}

export function RefundManualPaymentButton({ payment }: { payment: AdminPayment }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = (force = false) => {
    if (isLoading && !force) return;
    setIsOpen(false);
    setError(null);
    setReference("");
    setReason("");
  };

  const submit = async () => {
    if (!reference.trim() || reason.trim().length < 10) {
      setError("Ingresa una referencia y un motivo de al menos 10 caracteres.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await refundManualPayment(payment.id, reference.trim(), reason.trim());
       close(true);
       router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos registrar el reembolso.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
       <button className="inline-flex min-h-8 items-center gap-1 rounded-md border border-danger/25 px-2.5 text-2xs font-bold text-danger hover:bg-danger-soft" onClick={() => { setError(null); setIsOpen(true); }} type="button"><RotateCcw className="size-3" aria-hidden="true" />Reembolsar</button>
       <Modal isOpen={isOpen} onClose={close} size="sm" title="Registrar reembolso manual" description={`Pago ${payment.reference}. Esta acción descuenta el cobro de los ingresos confirmados.`} footer={<><ModalSecondaryButton onClick={close}>Cancelar</ModalSecondaryButton><ModalPrimaryButton disabled={isLoading} onClick={submit} tone="danger">{isLoading ? "Procesando..." : "Confirmar reembolso"}</ModalPrimaryButton></>}>
        <div className="space-y-4">
          <ErrorNote message={error} />
          <ModalField id={`refund-reference-${payment.id}`} label="Referencia del reembolso" required value={reference} onChange={(event) => setReference(event.target.value)} />
          <ModalTextarea id={`refund-reason-${payment.id}`} label="Motivo" required rows={4} value={reason} onChange={(event) => setReason(event.target.value)} />
        </div>
      </Modal>
    </>
  );
}
