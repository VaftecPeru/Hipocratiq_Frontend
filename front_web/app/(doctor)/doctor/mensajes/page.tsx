"use client";

import { MessageCircle, Search, Send, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getDoctorMessages, getDoctorPatients, markDoctorMessageRead, sendDoctorMessage, type DoctorMessage, type DoctorPatient } from "@/features/doctors/api/doctor-clinical";
import { DoctorAvatar, DoctorCard, StatusBadge } from "@/features/doctors/ui/doctor-primitives";
import { DoctorModuleAlert, DoctorModuleEmpty, DoctorModuleError, DoctorModuleLoading } from "@/features/doctors/ui/doctor-module-state";

const dateFormatter = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function initialsOf(name: string | null): string {
  return (name ?? "Paciente").split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "PA";
}

export default function DoctorMessagesPage() {
  const [messages, setMessages] = useState<DoctorMessage[]>([]);
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [unread, setUnread] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [readStatus, setReadStatus] = useState<"idle" | "reading">("idle");
  const readAttemptedIds = useRef(new Set<number>());
  const mountedRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getDoctorMessages(controller.signal), getDoctorPatients(controller.signal)])
      .then(([messageResult, patientList]) => {
        setMessages(messageResult.items);
        setUnread(messageResult.unread);
        setPatients(patientList);
        const firstPatient = messageResult.items.find((message) => message.patient)?.patient ?? patientList[0];
        if (firstPatient) setSelectedPatientId(String(firstPatient.id));
      })
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) setError(caught instanceof Error ? caught.message : "No pudimos cargar los mensajes.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedPatientId) return;

    const unreadMessages = messages.filter((message) => (
      message.isReceived
      && message.readAt === null
      && String(message.patient?.id) === selectedPatientId
      && !readAttemptedIds.current.has(message.id)
    ));

    if (unreadMessages.length === 0) return;

    unreadMessages.forEach((message) => readAttemptedIds.current.add(message.id));
    const conversationPatientId = selectedPatientId;
    setReadStatus("reading");

    void Promise.allSettled(unreadMessages.map((message) => markDoctorMessageRead(message.id))).then((results) => {
      if (!mountedRef.current) return;

      const readMessages = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
      const failedReads = results.filter((result) => result.status === "rejected");

      if (readMessages.length > 0) {
        const readById = new Map(readMessages.map((message) => [message.id, message]));
        setMessages((current) => current.map((message) => {
          const readMessage = readById.get(message.id);
          return readMessage ? { ...message, readAt: readMessage.readAt } : message;
        }));
        setUnread((current) => Math.max(0, current - readMessages.length));
      }

      if (conversationPatientId === selectedPatientId) {
        setReadStatus("idle");
        if (failedReads.length > 0) setError("No pudimos marcar todos los mensajes como leídos. Inténtalo de nuevo.");
      }
    });
  }, [messages, selectedPatientId]);

  const patientOptions = useMemo(() => {
    const byId = new Map<number, DoctorPatient | NonNullable<DoctorMessage["patient"]>>();
    patients.forEach((patient) => byId.set(patient.id, patient));
    messages.forEach((message) => { if (message.patient) byId.set(message.patient.id, message.patient); });
    return [...byId.values()];
  }, [messages, patients]);

  const selectedPatient = patientOptions.find((patient) => String(patient.id) === selectedPatientId) ?? null;
  const visibleMessages = messages.filter((message) => {
    const belongsToPatient = selectedPatientId === "" || String(message.patient?.id) === selectedPatientId;
    const matchesSearch = search.trim() === "" || `${message.patient?.name ?? ""} ${message.body}`.toLowerCase().includes(search.trim().toLowerCase());
    return belongsToPatient && matchesSearch;
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedPatient || draft.trim() === "") return;
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await sendDoctorMessage(selectedPatient.id, draft.trim());
      setMessages((current) => [created, ...current]);
      setDraft("");
      setSuccess("Mensaje enviado correctamente.");
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "No pudimos enviar el mensaje.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">Mensajes</h1><p className="mt-1 text-[0.68rem] font-bold text-ink-secondary">Comunicación persistida con pacientes vinculados a tu práctica.</p></div><StatusBadge tone={unread > 0 ? "orange" : "green"}>{unread > 0 ? `${unread} sin leer` : "Sin mensajes sin leer"}</StatusBadge></header>
      {error && messages.length > 0 ? <DoctorModuleAlert>{error}</DoctorModuleAlert> : null}
      {success ? <DoctorModuleAlert tone="success">{success}</DoctorModuleAlert> : null}
      {readStatus === "reading" ? <p className="sr-only" role="status" aria-live="polite">Marcando mensajes recibidos como leídos…</p> : null}

      {loading ? <DoctorModuleLoading label="Cargando mensajes…" /> : error && messages.length === 0 && patients.length === 0 ? <DoctorModuleError message={error} /> : (
        <section className="grid items-start gap-4 xl:grid-cols-[minmax(260px,0.75fr)_minmax(0,1.35fr)]" aria-label="Centro de mensajes">
          <DoctorCard className="min-w-0 overflow-hidden"><div className="border-b border-line p-3"><label className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface-input px-2.5 text-muted"><Search className="size-3.5" aria-hidden="true" /><span className="sr-only">Buscar mensajes</span><input className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-placeholder" placeholder="Buscar mensajes…" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label className="mt-3 grid gap-1 text-[0.58rem] font-bold text-ink-secondary">Paciente<select className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)}><option value="">Todos los pacientes</option>{patientOptions.map((patient) => <option key={patient.id} value={String(patient.id)}>{patient.name ?? `Paciente ${patient.id}`}</option>)}</select></label></div>{messages.length === 0 ? <DoctorModuleEmpty message="Aún no hay mensajes registrados." /> : <ul className="divide-y divide-line">{patientOptions.slice(0, 12).map((patient) => { const latest = messages.find((message) => message.patient?.id === patient.id); return <li key={patient.id}><button className={`flex w-full items-center gap-2.5 px-3 py-3 text-left hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus ${String(patient.id) === selectedPatientId ? "bg-accent-soft/70" : ""}`} type="button" onClick={() => setSelectedPatientId(String(patient.id))}><DoctorAvatar initials={initialsOf(patient.name)} tone={patient.id % 2 === 0 ? "blue" : "orange"} size="md" /><span className="min-w-0 flex-1"><span className="block truncate text-[0.62rem] font-extrabold">{patient.name ?? `Paciente ${patient.id}`}</span><span className="mt-1 block truncate text-[0.55rem] font-bold text-ink-secondary">{latest?.body ?? "Sin mensajes todavía"}</span></span></button></li>; })}</ul>}</DoctorCard>

          <DoctorCard className="min-w-0 overflow-hidden"><div className="flex items-center gap-3 border-b border-line px-4 py-3"><span className="grid size-9 place-items-center rounded-lg bg-accent-soft text-accent"><MessageCircle className="size-4" aria-hidden="true" /></span><div className="min-w-0"><h2 className="truncate text-[0.86rem] font-extrabold">{selectedPatient?.name ?? "Conversación clínica"}</h2><p className="mt-1 text-[0.56rem] font-bold text-ink-secondary">{selectedPatient ? "Paciente vinculado" : "Selecciona un paciente para comenzar"}</p></div><Users className="ml-auto size-4 text-muted" aria-hidden="true" /></div><div className="min-h-[300px] space-y-3 bg-paper/50 px-4 py-4">{visibleMessages.length === 0 ? <DoctorModuleEmpty message={selectedPatient ? "No hay mensajes para este paciente." : "Selecciona un paciente para ver la conversación."} /> : visibleMessages.slice(0, 50).reverse().map((message) => <article className="rounded-xl border border-line bg-surface px-3 py-2.5" key={message.id}><div className="flex items-center justify-between gap-3"><span className="text-[0.58rem] font-extrabold">{message.sender?.name ?? "Usuario"}</span><time className="text-[0.52rem] font-bold text-muted" dateTime={message.createdAt ?? undefined}>{formatDate(message.createdAt)}</time></div><p className="mt-1 text-[0.62rem] font-bold leading-5 text-ink-secondary">{message.body}</p></article>)}</div><form className="border-t border-line p-4" onSubmit={(event) => void handleSubmit(event)}><label className="sr-only" htmlFor="doctor-message">Nuevo mensaje</label><textarea id="doctor-message" className="min-h-20 w-full rounded-lg border border-line bg-surface-input px-3 py-2 text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20 disabled:opacity-60" placeholder={selectedPatient ? "Escribe un mensaje clínico…" : "Selecciona un paciente…"} value={draft} onChange={(event) => setDraft(event.target.value)} disabled={pending || !selectedPatient} maxLength={5000} required /><div className="mt-2 flex items-center justify-between gap-3"><p className="text-[0.55rem] font-bold text-ink-secondary">No incluyas datos fuera del expediente clínico.</p><button className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-accent px-3 text-[0.6rem] font-extrabold text-white hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={pending || !selectedPatient || draft.trim() === ""}>{pending ? "Enviando…" : <><Send className="size-3.5" aria-hidden="true" />Enviar</>}</button></div></form></DoctorCard>
        </section>
      )}
    </div>
  );
}
