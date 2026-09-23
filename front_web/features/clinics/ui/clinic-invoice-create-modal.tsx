"use client";

import {  CalendarDays,  CircleDollarSign,  FileText,  Loader2,  Search,  UserRound,  X,} from "lucide-react";
import {  useEffect,  useMemo,  useState,} from "react";
import {
  createClinicInvoice,
  getClinicPatients,
  recordClinicInvoicePayment,
} from "@/features/clinics/api/browser-clinic-dashboard";

import type {
  ClinicInvoice,
  ClinicPatient,
  ClinicPaymentMethod,
} from "@/features/clinics/model/clinic-admin.types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (invoice: ClinicInvoice) => void;
};

type InvoiceStatus = "pending" | "paid";

const paymentMethods: Array<{
  value: ClinicPaymentMethod;
  label: string;
}> = [
  {
    value: "cash",
    label: "Efectivo",
  },
  {
    value: "card",
    label: "Tarjeta",
  },
  {
    value: "bank_transfer",
    label: "Transferencia bancaria",
  },
  {
    value: "other",
    label: "Otro",
  },
];

function today(): string {
  const current = new Date();
  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, "0");
  const day = String(current.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildInvoiceNumber(patientId: number): string {
  const timestamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  return `HQ-${patientId}-${timestamp}`;
}

export function ClinicInvoiceCreateModal({  isOpen,  onClose,  onCreated,}: Readonly<Props>) 
{
  const [patients, setPatients] = useState< ClinicPatient[]  >([]);
  const [search, setSearch] = useState("");
  const [patientId, setPatientId] = useState<number | null>(null);
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod,setPaymentMethod] = useState<ClinicPaymentMethod | null>(null);
  const [status, setStatus] = useState<InvoiceStatus>("pending");
  const [issuedAt, setIssuedAt] = useState(today());
  const [dueAt, setDueAt] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedPatient = useMemo(() => patients.find((patient) => patient.id === patientId) ?? null,[patientId,patients]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const controller =new AbortController();
    const timer = window.setTimeout(() => {setIsLoadingPatients(true);
        getClinicPatients(search, 1, controller.signal,)
          .then((result) => {
            setPatients(result.patients);
          })
          .catch(
            (caughtError: unknown) => {
              if (
                caughtError instanceof DOMException && caughtError.name ==="AbortError"
              ) { return; }
              setError(
                caughtError instanceof Error ? caughtError.message : "No pudimos cargar los pacientes.",
              );
            },
          )
          .finally(() => {
            if (
              !controller.signal.aborted
            ) {setIsLoadingPatients(false)}
          });
      }, 300);

    return () => { window.clearTimeout(timer), controller.abort()};
  }, [isOpen, search]);

  useEffect(() => {
    if (status === "pending") {
      setPaymentMethod(null);
    }
  }, [status]);

  function resetForm(): void {
    setPatients([]);
    setSearch("");
    setPatientId(null);
    setConcept("");
    setAmount("");
    setPaymentMethod(null);
    setStatus("pending");
    setIssuedAt(today());
    setDueAt("");
    setNotes("");
    setError(null);
  }

  function handleClose(): void {
    if (isSaving) {
      return;
    }
    resetForm();
    onClose();
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError(null);

    if (patientId === null) {
      setError(
        "Selecciona un paciente.",
      );
      return;
    }

    if (concept.trim().length < 2) {
      setError(
        "Ingresa el concepto de la factura.",
      );
      return;
    }

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount,
      ) ||
      numericAmount <= 0
    ) {
      setError(
        "Ingresa un monto válido.",
      );
      return;
    }

    if (status === "paid" && paymentMethod === null) 
    {
      setError("Selecciona el método de pago.");
      return;
    }

    if (dueAt && dueAt < issuedAt)
    {
      setError("La fecha de vencimiento no puede ser anterior a la fecha de emisión.");
      return;
    }

    setIsSaving(true);

    try {
      const amountMinor = Math.round(numericAmount * 100);
      let invoice = await createClinicInvoice({
        patientId,
        invoiceNumber: buildInvoiceNumber(patientId),
        issueDate: issuedAt,
        dueDate: dueAt || null,
        currency: "USD",
        items: [
          {
            description: concept.trim(),
            quantity: 1,
            unitAmountMinor: amountMinor,
          },
        ],
      });

      if (status === "paid" && paymentMethod !== null) {
        const paymentResult = await recordClinicInvoicePayment(invoice.id, {
          amountMinor,
          currency: invoice.currency || "USD",
          paymentMethod,
          note: notes.trim() || null,
        });
        invoice = paymentResult.invoice;
      }

      onCreated(invoice);
      resetForm();
      onClose();
    } catch (caughtError: unknown ) 
    {
      setError(caughtError instanceof Error ? caughtError.message : "No pudimos crear la factura.");
    } finally {setIsSaving(false)}
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4"role="presentation">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-surface shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="invoice-create-title"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface px-5 py-4">
          <div>
            <p className="text-[0.6rem] font-bold uppercase tracking-wider text-accent">
              Facturación clínica
            </p>

            <h2
              id="invoice-create-title"
              className="mt-1 text-base font-extrabold"
            >
              Nueva factura
            </h2>

            <p className="mt-1 text-[0.62rem] text-muted">
              Registra un cobro para
              un paciente de la clínica.
            </p>
          </div>

          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-hover hover:text-ink"
            onClick={handleClose}
            disabled={isSaving}
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </header>

        <form
          className="space-y-5 p-5"
          onSubmit={handleSubmit}
        >
          {error ? (
            <div className="rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-xs font-semibold text-danger">
              {error}
            </div>
          ) : null}

          <section>
            <label
              htmlFor="invoice-patient-search"
              className="text-xs font-extrabold"
            >
              Paciente
            </label>

            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />

              <input
                id="invoice-patient-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Buscar paciente..."
                className="min-h-10 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-xs outline-none focus:border-accent"
              />
            </div>

            <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-line">
              {isLoadingPatients ? (
                <div className="flex items-center justify-center gap-2 p-4 text-xs font-semibold text-muted">
                  <Loader2 className="size-4 animate-spin" />
                  Buscando pacientes...
                </div>
              ) : patients.length ===
                0 ? (
                <div className="p-4 text-center text-xs text-muted">
                  No se encontraron
                  pacientes.
                </div>
              ) : (
                patients.map(
                  (patient) => (
                    <button
                      key={
                        patient.id
                      }
                      type="button"
                      onClick={() =>
                        setPatientId(
                          patient.id,
                        )
                      }
                      className={`flex w-full items-center gap-3 border-b border-line px-3 py-2.5 text-left last:border-b-0 ${
                        patientId ===
                        patient.id
                          ? "bg-accent-soft"
                          : "hover:bg-surface-hover"
                      }`}
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                        <UserRound className="size-4" />
                      </span>

                      <span className="min-w-0">
                        <strong className="block truncate text-xs">
                          {patient.name ??
                            "Paciente sin nombre"}
                        </strong>

                        <span className="font-mono text-[0.55rem] text-muted">
                          {
                            patient.patientCode
                          }
                        </span>
                      </span>
                    </button>
                  ),
                )
              )}
            </div>

            {selectedPatient ? (
              <div className="mt-2 rounded-lg bg-success-soft px-3 py-2 text-[0.62rem] font-bold text-success">
                Seleccionado:{" "}
                {selectedPatient.name ??
                  selectedPatient.patientCode}
              </div>
            ) : null}
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section>
              <label
                htmlFor="invoice-concept"
                className="text-xs font-extrabold"
              >
                Concepto
              </label>

              <div className="relative mt-2">
                <FileText className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />

                <input
                  id="invoice-concept"
                  value={concept}
                  onChange={(
                    event,
                  ) =>
                    setConcept(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Ej. Consulta médica"
                  maxLength={160}
                  className="min-h-10 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-xs outline-none focus:border-accent"
                />
              </div>
            </section>

            <section>
              <label
                htmlFor="invoice-amount"
                className="text-xs font-extrabold"
              >
                Monto
              </label>

              <div className="relative mt-2">
                <CircleDollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />

                <input
                  id="invoice-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(
                    event,
                  ) =>
                    setAmount(
                      event.target
                        .value,
                    )
                  }
                  placeholder="0.00"
                  className="min-h-10 w-full rounded-xl border border-line bg-surface pl-10 pr-3 font-mono text-xs outline-none focus:border-accent"
                />
              </div>

              <p className="mt-1 text-[0.55rem] text-muted">
                Moneda: USD
              </p>
            </section>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <section>
              <label
                htmlFor="invoice-issued-at"
                className="text-xs font-extrabold"
              >
                Fecha de emisión
              </label>

              <div className="relative mt-2">
                <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />

                <input
                  id="invoice-issued-at"
                  type="date"
                  value={issuedAt}
                  onChange={(
                    event,
                  ) =>
                    setIssuedAt(
                      event.target
                        .value,
                    )
                  }
                  className="min-h-10 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-xs outline-none focus:border-accent"
                />
              </div>
            </section>

            <section>
              <label
                htmlFor="invoice-due-at"
                className="text-xs font-extrabold"
              >
                Vencimiento
              </label>

              <input
                id="invoice-due-at"
                type="date"
                min={issuedAt}
                value={dueAt}
                onChange={(
                  event,
                ) =>
                  setDueAt(
                    event.target.value,
                  )
                }
                className="mt-2 min-h-10 w-full rounded-xl border border-line bg-surface px-3 text-xs outline-none focus:border-accent"
              />
            </section>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <section>
              <label
                htmlFor="invoice-status"
                className="text-xs font-extrabold"
              >
                Estado
              </label>

              <select
                id="invoice-status"
                value={status}
                onChange={(
                  event,
                ) =>
                  setStatus(
                    event.target
                      .value as InvoiceStatus,
                  )
                }
                className="mt-2 min-h-10 w-full rounded-xl border border-line bg-surface px-3 text-xs outline-none focus:border-accent"
              >
                <option value="pending">
                  Pendiente
                </option>

                <option value="paid">
                  Pagada
                </option>
              </select>
            </section>

            <section>
              <label
                htmlFor="invoice-payment-method"
                className="text-xs font-extrabold"
              >
                Método de pago
              </label>

              <select
                id="invoice-payment-method"
                value={
                  paymentMethod ?? ""
                }
                onChange={(
                  event,
                ) =>
                  setPaymentMethod(
                    event.target.value
                      ? (event.target
                          .value as ClinicPaymentMethod)
                      : null,
                  )
                }
                disabled={
                  status !== "paid"
                }
                className="mt-2 min-h-10 w-full rounded-xl border border-line bg-surface px-3 text-xs outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-accent"
              >
                <option value="">
                  Seleccionar
                </option>

                {paymentMethods.map(
                  (method) => (
                    <option
                      key={
                        method.value
                      }
                      value={
                        method.value
                      }
                    >
                      {method.label}
                    </option>
                  ),
                )}
              </select>

              {status ===
              "pending" ? (
                <p className="mt-1 text-[0.55rem] text-muted">
                  Se asignará cuando
                  se registre el pago.
                </p>
              ) : null}
            </section>
          </div>

          <section>
            <label htmlFor="invoice-notes"className="text-xs font-extrabold">Observaciones</label>
            <textarea
              id="invoice-notes"
              value={notes}
              onChange={(event,) => setNotes(event.target.value,)}
              maxLength={1000}rows={3}placeholder="Información adicional opcional..."className="mt-2 w-full resize-none rounded-xl border border-line bg-surface p-3 text-xs outline-none focus:border-accent"
            />
          </section>

          <footer className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="min-h-10 rounded-xl border border-line px-4 text-xs font-extrabold hover:bg-surface-hover disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-xs font-extrabold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />Guardando...</>
              ) : ( "Crear factura")}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}