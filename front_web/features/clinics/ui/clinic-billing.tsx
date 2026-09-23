"use client";

import {
  Banknote,
  Check,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
  Eye,
  Landmark,
  Loader2,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createClinicInvoice,
  getClinicBillingInvoices,
  getClinicBillingReport,
  getClinicInvoice,
  getClinicPatients,
  recordClinicInvoicePayment,
} from "@/features/clinics/api/browser-clinic-dashboard";
import type {
  ClinicBillingCurrencySummary,
  ClinicBillingReport,
  ClinicInvoice,
  ClinicInvoiceStatus,
  ClinicPaymentMethod,
  ClinicPatient,
} from "@/features/clinics/model/clinic-admin.types";
import { Modal } from "@/shared/ui/modal";
import {
  ModalField,
  ModalGrid,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalSelect,
  ModalTextarea,
} from "@/shared/ui/modal-parts";
import { AdminMetric, Notice, SectionCard, useNotice } from "./clinic-admin-primitives";

type ReportPeriod = "Hoy" | "Esta semana" | "Este mes";

const REPORT_PERIODS: readonly ReportPeriod[] = ["Hoy", "Esta semana", "Este mes"];

const statusStyles: Record<ClinicInvoiceStatus | "overdue", string> = {
  issued: "bg-warning-soft text-warning",
  partially_paid: "bg-accent-soft text-accent",
  paid: "bg-success-soft text-success",
  voided: "bg-surface-subtle text-muted",
  overdue: "bg-danger-soft text-danger",
};

const statusLabels: Record<ClinicInvoiceStatus | "overdue", string> = {
  issued: "Pendiente",
  partially_paid: "Pago parcial",
  paid: "Pagada",
  voided: "Anulada",
  overdue: "Vencida",
};

const paymentMethodLabels: Record<ClinicPaymentMethod, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  bank_transfer: "Transferencia",
  other: "Otro",
};

const paymentMethodIcons: Record<ClinicPaymentMethod, typeof Banknote> = {
  cash: Banknote,
  card: CreditCard,
  bank_transfer: Landmark,
  other: ShieldCheck,
};

const INVOICE_DATE_FORMATTER = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" });

function dateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function periodRange(period: ReportPeriod): { from: string; to: string } {
  const today = new Date();
  const from = new Date(today);
  const to = new Date(today);

  if (period === "Esta semana") {
    const day = from.getDay();
    from.setDate(from.getDate() - (day === 0 ? 6 : day - 1));
    to.setTime(from.getTime());
    to.setDate(from.getDate() + 6);
  } else if (period === "Este mes") {
    from.setDate(1);
    to.setMonth(to.getMonth() + 1, 0);
  }

  return { from: dateKey(from), to: dateKey(to) };
}

function formatMoney(minor: number, currency: string): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(minor / 100);
}

function parseAmountMinor(value: string): number {
  const normalized = value.trim().replace(",", ".");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

function invoiceStatus(invoice: ClinicInvoice, today: string): ClinicInvoiceStatus | "overdue" {
  if (invoice.status === "issued" && invoice.dueDate !== null && invoice.dueDate < today) return "overdue";
  return invoice.status;
}

function initials(name: string | null): string {
  return (name ?? "Paciente")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function invoiceDate(value: string | null): string {
  if (!value) return "—";
  return INVOICE_DATE_FORMATTER.format(new Date(`${value}T12:00:00`));
}

function BillingTable({
  invoices,
  onView,
  onPay,
}: Readonly<{
  invoices: ClinicInvoice[];
  onView: (invoice: ClinicInvoice) => void;
  onPay: (invoice: ClinicInvoice) => void;
}>) {
  const today = dateKey(new Date());

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-205 text-left">
        <caption className="sr-only">Facturas clínicas del periodo seleccionado</caption>
        <thead className="bg-surface-subtle text-[0.56rem] font-extrabold tracking-wide text-muted uppercase">
          <tr>
            <th className="px-4 py-2.5" scope="col">Paciente</th>
            <th className="px-3 py-2.5" scope="col">Fecha</th>
            <th className="px-3 py-2.5" scope="col">Total</th>
            <th className="px-3 py-2.5" scope="col">Pendiente</th>
            <th className="px-3 py-2.5" scope="col">Estado</th>
            <th className="px-4 py-2.5 text-right" scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {invoices.map((invoice, index) => {
            const status = invoiceStatus(invoice, today);
            return (
              <tr className="text-[0.64rem] transition-colors hover:bg-surface-hover" key={invoice.id}>
                <th className="px-4 py-2.5 font-normal" scope="row">
                  <div className="flex items-center gap-2.5">
                    <span className={`grid size-8 shrink-0 place-items-center rounded-full font-mono text-[0.52rem] font-bold ${index % 2 ? "bg-violet-soft text-violet" : "bg-accent-soft text-accent"}`} aria-hidden="true">
                      {initials(invoice.patient.name)}
                    </span>
                    <div>
                      <p className="font-extrabold">{invoice.patient.name ?? "Paciente sin nombre"}</p>
                      <p className="mt-0.5 font-mono text-[0.5rem] text-muted">{invoice.invoiceNumber}</p>
                    </div>
                  </div>
                </th>
                <td className="px-3 py-2.5 font-mono font-semibold text-ink-secondary">{invoiceDate(invoice.issueDate)}</td>
                <td className="px-3 py-2.5 font-mono font-extrabold">{formatMoney(invoice.totalMinor, invoice.currency)}</td>
                <td className="px-3 py-2.5 font-mono font-semibold text-ink-secondary">{formatMoney(invoice.outstandingMinor, invoice.currency)}</td>
                <td className="px-3 py-2.5"><span className={`rounded-md px-2 py-1 text-[0.55rem] font-extrabold ${statusStyles[status]}`}>{statusLabels[status]}</span></td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex justify-end gap-1">
                    <button className="grid size-8 place-items-center rounded-lg text-muted hover:bg-accent-soft hover:text-accent focus-visible:outline-2 focus-visible:outline-focus" type="button" aria-label={`Ver factura ${invoice.invoiceNumber}`} onClick={() => onView(invoice)}>
                      <Eye className="size-3.5" aria-hidden="true" />
                    </button>
                    {invoice.outstandingMinor > 0 && invoice.status !== "voided" ? (
                      <button className="grid size-8 place-items-center rounded-lg text-muted hover:bg-success-soft hover:text-success focus-visible:outline-2 focus-visible:outline-focus" type="button" aria-label={`Registrar pago para ${invoice.invoiceNumber}`} onClick={() => onPay(invoice)}>
                        <WalletCards className="size-3.5" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
          {invoices.length === 0 ? (
            <tr>
              <td className="px-4 py-10 text-center text-xs font-semibold text-muted" colSpan={6}>No hay facturas en el periodo seleccionado.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function PaymentModal({
  invoice,
  isOpen,
  onClose,
  onSaved,
}: Readonly<{
  invoice: ClinicInvoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (invoice: ClinicInvoice) => void;
}>) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<ClinicPaymentMethod>("cash");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invoice || !isOpen) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setAmount((invoice.outstandingMinor / 100).toFixed(2));
      setPaymentMethod("cash");
      setReference("");
      setNote("");
      setError(null);
    });
    return () => { active = false; };
  }, [invoice, isOpen]);

  if (!invoice) return null;
  const selectedInvoice = invoice;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const amountMinor = parseAmountMinor(amount);
    if (amountMinor < 1 || amountMinor > selectedInvoice.outstandingMinor) {
      setError(`Ingresa un importe entre 0.01 y ${formatMoney(selectedInvoice.outstandingMinor, selectedInvoice.currency)}.`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await recordClinicInvoicePayment(selectedInvoice.id, {
        amountMinor,
        currency: selectedInvoice.currency,
        paymentMethod,
        reference: reference.trim() || null,
        note: note.trim() || null,
      });
      onSaved(result.invoice);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos registrar el pago.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { if (!saving) onClose(); }}
      title="Registrar pago"
      description={`${invoice.invoiceNumber} · ${invoice.patient.name ?? "Paciente sin nombre"}`}
      size="md"
      footer={(
        <>
          <ModalSecondaryButton disabled={saving} onClick={onClose}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton disabled={saving} form="clinic-payment-form" type="submit">
            {saving ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Check className="size-3.5" aria-hidden="true" />}
            {saving ? "Registrando..." : "Registrar pago"}
          </ModalPrimaryButton>
        </>
      )}
    >
      <form className="space-y-4" id="clinic-payment-form" noValidate onSubmit={handleSubmit}>
        <div className="rounded-lg border border-line bg-surface-subtle p-3 text-xs">
          <div className="flex justify-between gap-3"><span className="font-semibold text-muted">Saldo pendiente</span><strong className="font-mono">{formatMoney(invoice.outstandingMinor, invoice.currency)}</strong></div>
        </div>
        <ModalGrid>
          <ModalField id="clinic-payment-amount" label={`Importe (${invoice.currency})`} type="number" inputMode="decimal" min={0.01} step={0.01} value={amount} onChange={(event) => setAmount(event.target.value)} required />
          <ModalSelect id="clinic-payment-method" label="Método de pago" options={Object.entries(paymentMethodLabels).map(([value, label]) => ({ value, label }))} value={paymentMethod} onChange={(value) => setPaymentMethod(value as ClinicPaymentMethod)} required />
        </ModalGrid>
        <ModalField id="clinic-payment-reference" label="Referencia" placeholder="Folio o referencia (opcional)" value={reference} onChange={(event) => setReference(event.target.value)} />
        <ModalTextarea id="clinic-payment-note" label="Nota" placeholder="Observación del cobro (opcional)" value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
        {error ? <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-bold text-danger" role="alert">{error}</p> : null}
      </form>
    </Modal>
  );
}

function CreateInvoiceModal({
  isOpen,
  onClose,
  onCreated,
}: Readonly<{
  isOpen: boolean;
  onClose: () => void;
  onCreated: (invoice: ClinicInvoice) => void;
}>) {
  const [patientQuery, setPatientQuery] = useState("");
  const [patients, setPatients] = useState<ClinicPatient[]>([]);
  const [patient, setPatient] = useState<ClinicPatient | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState(() => dateKey(new Date()));
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("MXN");
  const [description, setDescription] = useState("Consulta médica");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    let active = true;
    queueMicrotask(() => { if (active) setLoadingPatients(true); });
    getClinicPatients(patientQuery, 1, controller.signal)
      .then((result) => { if (!controller.signal.aborted) setPatients(result.patients.slice(0, 8)); })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : "No pudimos buscar pacientes.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoadingPatients(false); });
    return () => { active = false; controller.abort(); };
  }, [isOpen, patientQuery]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setPatientQuery("");
      setPatients([]);
      setPatient(null);
      setInvoiceNumber("");
      setIssueDate(dateKey(new Date()));
      setDueDate("");
      setCurrency("MXN");
      setDescription("Consulta médica");
      setAmount("");
      setError(null);
    });
    return () => { active = false; };
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const amountMinor = parseAmountMinor(amount);
    if (!patient || !invoiceNumber.trim() || !issueDate || !description.trim() || amountMinor < 1) {
      setError("Completa paciente, número, concepto y un importe mayor que cero.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const invoice = await createClinicInvoice({
        patientId: patient.id,
        invoiceNumber: invoiceNumber.trim(),
        issueDate,
        dueDate: dueDate || null,
        currency,
        items: [{ description: description.trim(), quantity: 1, unitAmountMinor: amountMinor }],
      });
      onCreated(invoice);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos crear la factura.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { if (!saving) onClose(); }}
      title="Nueva factura"
      description="Registra un cobro de paciente en la clínica."
      size="lg"
      footer={(
        <>
          <ModalSecondaryButton disabled={saving} onClick={onClose}>Cancelar</ModalSecondaryButton>
          <ModalPrimaryButton disabled={saving} form="clinic-invoice-form" type="submit">
            {saving ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Plus className="size-3.5" aria-hidden="true" />}
            {saving ? "Guardando..." : "Crear factura"}
          </ModalPrimaryButton>
        </>
      )}
    >
      <form className="space-y-4" id="clinic-invoice-form" noValidate onSubmit={handleSubmit}>
        <div className="grid min-w-0 gap-1.5">
          <label className="text-2xs font-bold text-muted" htmlFor="clinic-invoice-patient-search">Paciente <span className="ml-0.5 text-danger">*</span></label>
          {patient ? (
            <div className="flex items-center justify-between rounded-lg border border-accent bg-accent-soft px-3 py-2 text-xs">
              <span className="font-extrabold">{patient.name ?? "Paciente sin nombre"} <span className="ml-2 font-mono text-[0.58rem] text-muted">{patient.patientCode}</span></span>
              <button className="rounded-md p-1 text-muted hover:text-danger focus-visible:outline-2 focus-visible:outline-focus" type="button" aria-label="Quitar paciente seleccionado" onClick={() => { setPatient(null); setPatientQuery(""); }}>
                ×
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input id="clinic-invoice-patient-search" className="h-11 w-full rounded-lg border border-line bg-surface-input pr-3 pl-9 text-xs font-medium text-ink outline-none transition-colors focus:border-accent focus:bg-surface focus:ring-3 focus:ring-focus/40" placeholder="Buscar por nombre o código..." value={patientQuery} onChange={(event) => setPatientQuery(event.target.value)} autoComplete="off" required />
              </div>
              {loadingPatients ? <p className="text-2xs text-muted" role="status">Buscando pacientes...</p> : null}
              {patients.length > 0 ? <ul className="max-h-40 overflow-y-auto rounded-lg border border-line bg-surface" aria-label="Resultados de pacientes">{patients.map((result) => <li key={result.id}><button className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-focus" type="button" onClick={() => { setPatient(result); setPatientQuery(result.name ?? ""); setPatients([]); }}><span className="font-extrabold">{result.name ?? "Sin nombre"}</span><span className="font-mono text-[0.58rem] text-muted">{result.patientCode}</span></button></li>)}</ul> : null}
            </>
          )}
        </div>
        <ModalGrid>
          <ModalField id="clinic-invoice-number" label="Número de factura" placeholder="FAC-0001" value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} required />
          <ModalSelect id="clinic-invoice-currency" label="Moneda" options={["MXN", "USD", "PEN"]} value={currency} onChange={setCurrency} required />
          <ModalField id="clinic-invoice-issue-date" label="Fecha de emisión" type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} required />
          <ModalField id="clinic-invoice-due-date" label="Fecha de vencimiento" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} min={issueDate} />
        </ModalGrid>
        <ModalGrid>
          <ModalField id="clinic-invoice-description" label="Concepto" placeholder="Consulta médica" value={description} onChange={(event) => setDescription(event.target.value)} required />
          <ModalField id="clinic-invoice-amount" label={`Importe (${currency})`} type="number" inputMode="decimal" min={0.01} step={0.01} value={amount} onChange={(event) => setAmount(event.target.value)} required />
        </ModalGrid>
        {error ? <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-bold text-danger" role="alert">{error}</p> : null}
      </form>
    </Modal>
  );
}

function InvoiceDetailModal({
  invoice,
  isOpen,
  isLoading,
  onClose,
}: Readonly<{
  invoice: ClinicInvoice | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
}>) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  if (!invoice) return null;

  async function handleExport(): Promise<void> {
    setExporting(true);
    setExportError(null);

    try {
      const [{ pdf }, { ClinicInvoicePdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/features/clinics/ui/clinic-invoice-pdf"),
      ]);
      const blob = await pdf(<ClinicInvoicePdf invoice={invoice} />).toBlob();

      if (blob.type !== "application/pdf") {
        throw new Error("La exportación no devolvió un archivo PDF válido.");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeInvoiceNumber = invoice.invoiceNumber.replace(/[^a-zA-Z0-9._-]+/g, "-");
      link.href = url;
      link.download = `hipocratiq-factura-${safeInvoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error: unknown) {
      setExportError(error instanceof Error ? error.message : "No pudimos generar la factura en PDF.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Factura ${invoice.invoiceNumber}`}
      description={invoice.patient.name ?? "Paciente sin nombre"}
      size="md"
      footer={(
        <>
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-extrabold text-accent hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={() => void handleExport()}
            disabled={exporting || isLoading}
          >
            <Download className="size-3.5" aria-hidden="true" />
            {exporting ? "Generando PDF..." : "Descargar A4"}
          </button>
          <ModalSecondaryButton onClick={onClose}>Cerrar</ModalSecondaryButton>
        </>
      )}
    >
      {exportError ? <p className="mb-3 rounded-lg bg-danger-soft px-3 py-2 text-xs font-bold text-danger" role="alert">{exportError}</p> : null}
      {isLoading ? <div className="grid min-h-32 place-items-center text-xs font-semibold text-muted" role="status"><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />Cargando detalle...</div> : <div className="space-y-4 text-xs">
        <dl className="divide-y divide-line rounded-lg border border-line bg-surface-subtle px-3"><div className="flex justify-between gap-3 py-2.5"><dt className="font-semibold text-muted">Emisión</dt><dd className="font-mono font-bold">{invoiceDate(invoice.issueDate)}</dd></div><div className="flex justify-between gap-3 py-2.5"><dt className="font-semibold text-muted">Total</dt><dd className="font-mono font-bold">{formatMoney(invoice.totalMinor, invoice.currency)}</dd></div><div className="flex justify-between gap-3 py-2.5"><dt className="font-semibold text-muted">Pagado</dt><dd className="font-mono font-bold text-success">{formatMoney(invoice.paidMinor, invoice.currency)}</dd></div><div className="flex justify-between gap-3 py-2.5"><dt className="font-semibold text-muted">Pendiente</dt><dd className="font-mono font-bold">{formatMoney(invoice.outstandingMinor, invoice.currency)}</dd></div></dl>
        <section><h3 className="font-extrabold">Conceptos</h3><ul className="mt-2 divide-y divide-line rounded-lg border border-line">{(invoice.items ?? []).map((item) => <li className="flex justify-between gap-3 px-3 py-2.5" key={item.id}><span>{item.description} × {item.quantity}</span><strong className="font-mono">{formatMoney(item.lineTotalMinor, invoice.currency)}</strong></li>)}{invoice.items?.length === 0 ? <li className="px-3 py-2.5 text-muted">Sin conceptos detallados.</li> : null}</ul></section>
        <section><h3 className="font-extrabold">Pagos registrados</h3><ul className="mt-2 divide-y divide-line rounded-lg border border-line">{(invoice.payments ?? []).map((payment) => { const Icon = paymentMethodIcons[payment.paymentMethod] ?? ShieldCheck; return <li className="flex items-center gap-2 px-3 py-2.5" key={payment.id}><Icon className="size-3.5 text-muted" aria-hidden="true" /><span className="flex-1">{paymentMethodLabels[payment.paymentMethod]}</span><strong className="font-mono">{formatMoney(payment.amountMinor, payment.currency)}</strong></li>; })}{invoice.payments?.length === 0 ? <li className="px-3 py-2.5 text-muted">No hay pagos registrados.</li> : null}</ul></section>
      </div>}
    </Modal>
  );
}

function BillingSidebar({ report }: Readonly<{ report: ClinicBillingReport | null }>) {
  const summaries = Object.values(report?.byCurrency ?? {});
  return (
    <aside className="grid gap-3">
      <SectionCard className="p-4">
        <h2 className="text-xs font-extrabold">Resumen de cobros</h2>
        {summaries.length > 0 ? <div className="mt-3 grid gap-3">{summaries.map((summary) => <div className="rounded-lg border border-line bg-surface-subtle p-3" key={summary.currency}><p className="font-mono text-[0.58rem] font-extrabold text-accent">{summary.currency}</p><dl className="mt-2 grid gap-2 text-[0.6rem]"><div className="flex justify-between gap-2"><dt className="text-muted">Cobrado</dt><dd className="font-mono font-extrabold">{formatMoney(summary.paidMinor, summary.currency)}</dd></div><div className="flex justify-between gap-2"><dt className="text-muted">Por cobrar</dt><dd className="font-mono font-extrabold">{formatMoney(summary.outstandingMinor, summary.currency)}</dd></div><div className="flex justify-between gap-2"><dt className="text-muted">Pagos</dt><dd className="font-mono font-extrabold">{summary.paymentCount}</dd></div></dl></div>)}</div> : <p className="mt-3 text-xs text-muted">No hay movimientos en el periodo seleccionado.</p>}
      </SectionCard>
      <SectionCard className="p-4">
        <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-violet-soft text-violet"><ShieldCheck className="size-4" aria-hidden="true" /></span><h2 className="text-xs font-extrabold">Alcance del módulo</h2></div>
        <p className="mt-3 text-[0.62rem] leading-relaxed text-muted">Esta pantalla muestra cobros de pacientes. La suscripción de la plataforma se administra por separado.</p>
      </SectionCard>
    </aside>
  );
}

export function ClinicBilling({ receptionist = false }: Readonly<{ receptionist?: boolean }>) {
  const [period, setPeriod] = useState<ReportPeriod>("Este mes");
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState<ClinicInvoice[]>([]);
  const [report, setReport] = useState<ClinicBillingReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [paymentInvoice, setPaymentInvoice] = useState<ClinicInvoice | null>(null);
  const [detailInvoice, setDetailInvoice] = useState<ClinicInvoice | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const { notice, showNotice } = useNotice();
  const range = useMemo(() => periodRange(period), [period]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setIsLoading(true);
      setError(null);
    });
    Promise.all([
      getClinicBillingInvoices({ from: range.from, to: range.to, search }, controller.signal),
      getClinicBillingReport(range.from, range.to, controller.signal),
    ])
      .then(([invoicePage, billingReport]) => {
        if (controller.signal.aborted) return;
        setInvoices(invoicePage.invoices);
        setReport(billingReport);
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        const message = requestError instanceof Error ? requestError.message : "No pudimos cargar la facturación clínica.";
        setError(message);
        showNotice(message);
      })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [range.from, range.to, refreshToken, search, showNotice]);

  const primarySummary: ClinicBillingCurrencySummary | null = useMemo(() => {
    const summaries = Object.values(report?.byCurrency ?? {});
    return summaries.find((summary) => summary.currency === "MXN") ?? summaries[0] ?? null;
  }, [report]);

  async function openDetails(invoice: ClinicInvoice): Promise<void> {
    setDetailInvoice(invoice);
    setDetailLoading(true);
    try {
      setDetailInvoice(await getClinicInvoice(invoice.id));
    } catch (requestError: unknown) {
      showNotice(requestError instanceof Error ? requestError.message : "No pudimos cargar el detalle de la factura.");
    } finally {
      setDetailLoading(false);
    }
  }

  function handlePaymentSaved(updatedInvoice: ClinicInvoice): void {
    setInvoices((current) => current.map((invoice) => invoice.id === updatedInvoice.id ? updatedInvoice : invoice));
    setPaymentInvoice(null);
    setRefreshToken((token) => token + 1);
    showNotice("Pago registrado correctamente.");
  }

  function handleInvoiceCreated(invoice: ClinicInvoice): void {
    setInvoices((current) => [invoice, ...current]);
    setCreateOpen(false);
    setRefreshToken((token) => token + 1);
    showNotice("Factura creada correctamente.");
  }

  const firstOutstandingInvoice = invoices.find((invoice) => invoice.outstandingMinor > 0 && invoice.status !== "voided") ?? null;

  return (
    <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
      <Notice message={notice} />
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0"><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">{receptionist ? "Recepción · caja" : "Control financiero"}</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">{receptionist ? "Caja y Pagos" : "Facturación"}</h1><p className="mt-1 text-xs text-muted">{receptionist ? "Registra cobros de pacientes desde recepción." : "Administra facturas y cobros de pacientes de la clínica."}</p></div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-extrabold hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={() => setRefreshToken((token) => token + 1)} disabled={isLoading}><RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />Actualizar</button>
          {receptionist ? <button className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white shadow-sm hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={() => { if (firstOutstandingInvoice) setPaymentInvoice(firstOutstandingInvoice); else showNotice("No hay facturas pendientes de cobro en este periodo."); }} disabled={!firstOutstandingInvoice}><WalletCards className="size-3.5" aria-hidden="true" />Nuevo pago</button> : <button className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white shadow-sm hover:bg-accent-hover" type="button" onClick={() => setCreateOpen(true)}><Plus className="size-3.5" aria-hidden="true" />Nueva factura</button>}
        </div>
      </header>

      {error ? <div className="mt-4 rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-xs font-semibold text-danger" role="alert">{error}</div> : null}

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de facturación">
        <AdminMetric icon={WalletCards} label="Cobrado en el periodo" value={primarySummary ? formatMoney(primarySummary.paidMinor, primarySummary.currency) : "—"} helper={primarySummary?.currency ?? "Sin movimientos"} tone="bg-success-soft text-success" />
        <AdminMetric icon={ReceiptText} label="Facturado" value={primarySummary ? formatMoney(primarySummary.invoicedMinor, primarySummary.currency) : "—"} helper={primarySummary ? `${primarySummary.invoiceCount} facturas` : "Sin movimientos"} tone="bg-accent-soft text-accent" />
        <AdminMetric icon={Clock3} label="Pendiente de cobro" value={primarySummary ? formatMoney(primarySummary.outstandingMinor, primarySummary.currency) : "—"} helper="Saldo clínico" tone="bg-warning-soft text-warning" />
        <AdminMetric icon={CircleDollarSign} label="Pagos registrados" value={primarySummary ? String(primarySummary.paymentCount) : "—"} helper="En el periodo" tone="bg-violet-soft text-violet" />
      </section>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-4">
          <SectionCard className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center">
              <div><h2 className="text-xs font-extrabold">Facturas del periodo</h2><p className="mt-0.5 text-[0.58rem] text-muted">Datos sincronizados con facturación clínica.</p></div>
              <div className="flex flex-wrap gap-2 sm:ml-auto">
                <div className="flex rounded-lg bg-surface-subtle p-1">{REPORT_PERIODS.map((item) => <button className={`min-h-7 rounded-md px-3 text-[0.56rem] font-bold ${period === item ? "bg-surface text-accent shadow-sm" : "text-muted"}`} type="button" key={item} onClick={() => setPeriod(item)}>{item}</button>)}</div>
                <label className="relative block"><span className="sr-only">Buscar facturas</span><Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" /><input className="h-8 w-full rounded-lg border border-line bg-surface-input pr-2 pl-8 text-[0.6rem] outline-none focus:border-accent focus:ring-3 focus:ring-focus/40 sm:w-44" placeholder="Buscar factura..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
              </div>
            </div>
            {isLoading ? <div className="grid min-h-48 place-items-center text-xs font-semibold text-muted" role="status"><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />Cargando facturas...</div> : <BillingTable invoices={invoices} onView={openDetails} onPay={setPaymentInvoice} />}
            <div className="border-t border-line px-4 py-3"><p className="text-[0.58rem] text-muted">{invoices.length} facturas cargadas para {range.from} — {range.to}.</p></div>
          </SectionCard>
        </div>
        <BillingSidebar report={report} />
      </div>

      <PaymentModal invoice={paymentInvoice} isOpen={paymentInvoice !== null} onClose={() => setPaymentInvoice(null)} onSaved={handlePaymentSaved} />
      <InvoiceDetailModal invoice={detailInvoice} isOpen={detailInvoice !== null} isLoading={detailLoading} onClose={() => setDetailInvoice(null)} />
      {!receptionist ? <CreateInvoiceModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={handleInvoiceCreated} /> : null}
    </div>
  );
}
