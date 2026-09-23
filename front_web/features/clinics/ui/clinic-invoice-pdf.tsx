"use client";

import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ClinicInvoice, ClinicPaymentMethod } from "@/features/clinics/model/clinic-admin.types";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: "#101b33",
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingBottom: 42,
    paddingHorizontal: 34,
    paddingTop: 30,
  },
  header: {
    alignItems: "center",
    borderBottomColor: "#dce4f0",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
  },
  brand: { alignItems: "center", flexDirection: "row", gap: 8 },
  logo: { height: 34, objectFit: "contain", width: 34 },
  brandName: { color: "#101b33", fontSize: 15, fontWeight: 700, letterSpacing: 1.2 },
  brandCaption: { color: "#496584", fontSize: 7, marginTop: 2 },
  invoiceMeta: { alignItems: "flex-end" },
  invoiceTitle: { color: "#0862dd", fontSize: 12, fontWeight: 700 },
  invoiceNumber: { color: "#101b33", fontSize: 9, marginTop: 3 },
  section: {
    borderColor: "#dce4f0",
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
  },
  sectionTitle: {
    color: "#0862dd",
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 7,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  field: { marginBottom: 3, width: "31%" },
  fieldWide: { marginBottom: 3, width: "64%" },
  label: { color: "#6e7f9d", fontSize: 6.7, fontWeight: 700, marginBottom: 2, textTransform: "uppercase" },
  value: { color: "#101b33", fontSize: 8.5 },
  tableHeader: {
    backgroundColor: "#eef4fb",
    flexDirection: "row",
    paddingHorizontal: 7,
    paddingVertical: 6,
  },
  row: {
    borderBottomColor: "#e5ebf4",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 7,
    paddingVertical: 7,
  },
  description: { flexGrow: 1, width: "56%" },
  qty: { textAlign: "center", width: "12%" },
  amount: { textAlign: "right", width: "32%" },
  summary: { alignSelf: "flex-end", marginTop: 8, width: "48%" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  summaryTotal: { borderTopColor: "#dce4f0", borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 3, paddingTop: 5 },
  paymentRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  muted: { color: "#6e7f9d" },
  footer: {
    bottom: 16,
    color: "#6e7f9d",
    fontSize: 7,
    left: 34,
    position: "absolute",
    right: 34,
    textAlign: "center",
  },
});

const paymentMethodLabels: Record<ClinicPaymentMethod, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  bank_transfer: "Transferencia bancaria",
  other: "Otro",
};

function formatMoney(minor: number, currency: string): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(minor / 100);
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(date);
}

function Field({ label, value, wide = false }: Readonly<{ label: string; value: string; wide?: boolean }>) {
  return (
    <View style={wide ? styles.fieldWide : styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "—"}</Text>
    </View>
  );
}

export function ClinicInvoicePdf({ invoice }: Readonly<{ invoice: ClinicInvoice }>) {
  return (
    <Document
      author="HIPOCRATIQ"
      subject="Factura clínica"
      title={`Factura ${invoice.invoiceNumber}`}
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image src="/logo_hipogratiq_1.png" style={styles.logo} />
            <View>
              <Text style={styles.brandName}>HIPOCRATIQ</Text>
              <Text style={styles.brandCaption}>Expediente clínico y gestión de atención</Text>
            </View>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>FACTURA CLÍNICA</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos de facturación</Text>
          <View style={styles.grid}>
            <Field label="Paciente" value={invoice.patient.name ?? "Paciente sin nombre"} wide />
            <Field label="Moneda" value={invoice.currency} />
            <Field label="Correo" value={invoice.patient.email ?? "—"} wide />
            <Field label="Teléfono" value={invoice.patient.phoneNumber ?? "—"} />
            <Field label="Fecha de emisión" value={formatDate(invoice.issueDate)} />
            <Field label="Vencimiento" value={formatDate(invoice.dueDate)} />
            <Field label="Estado" value={invoice.status.replaceAll("_", " ")} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conceptos</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.description}>Descripción</Text>
            <Text style={styles.qty}>Cant.</Text>
            <Text style={styles.amount}>Importe</Text>
          </View>
          {(invoice.items ?? []).map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.qty}>{item.quantity}</Text>
              <Text style={styles.amount}>{formatMoney(item.lineTotalMinor, invoice.currency)}</Text>
            </View>
          ))}
          {(invoice.items ?? []).length === 0 ? (
            <View style={styles.row}>
              <Text style={[styles.description, styles.muted]}>Sin conceptos detallados.</Text>
            </View>
          ) : null}

          <View style={styles.summary}>
            <View style={styles.summaryRow}><Text>Total</Text><Text>{formatMoney(invoice.totalMinor, invoice.currency)}</Text></View>
            <View style={styles.summaryRow}><Text>Pagado</Text><Text>{formatMoney(invoice.paidMinor, invoice.currency)}</Text></View>
            <View style={styles.summaryTotal}><Text>Saldo pendiente</Text><Text>{formatMoney(invoice.outstandingMinor, invoice.currency)}</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pagos registrados</Text>
          {(invoice.payments ?? []).map((payment) => (
            <View key={payment.id} style={styles.paymentRow}>
              <Text>{paymentMethodLabels[payment.paymentMethod]}{payment.reference ? ` · ${payment.reference}` : ""}</Text>
              <Text>{formatMoney(payment.amountMinor, payment.currency)}</Text>
            </View>
          ))}
          {(invoice.payments ?? []).length === 0 ? <Text style={styles.muted}>No hay pagos registrados.</Text> : null}
        </View>

        <Text fixed style={styles.footer}>HIPOCRATIQ · Documento A4 generado desde la plataforma clínica</Text>
      </Page>
    </Document>
  );
}
