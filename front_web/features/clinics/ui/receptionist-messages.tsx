"use client";

import { CircleUserRound, Mail, Search, Send } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getClinicMessages, markClinicMessageRead, sendClinicMessage } from "@/features/clinics/api/browser-clinic-dashboard";
import type { ClinicMessage, ClinicMessageContact, ClinicMessagesData } from "@/features/clinics/model/clinic-admin.types";
import { ClinicModuleLoading } from "@/shared/ui/clinic-module-loading";
import { Notice, SectionCard, useNotice } from "./clinic-admin-primitives";

type ConversationTab = "all" | "unread" | "patient" | "team";

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function initials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function displayName(contact: ClinicMessageContact | null | undefined): string {
  return contact?.name?.trim() || "Contacto sin nombre";
}

function kindLabel(kind: ClinicMessageContact["kind"]): string {
  return kind === "patient" ? "Paciente" : "Equipo";
}

function statusLabel(contact: ClinicMessageContact): string {
  if (contact.status === "active") return "Activo";
  if (contact.status === "pending_verification") return "Pendiente de verificación";
  if (contact.status === "suspended") return "Suspendido";
  if (contact.status === "disabled") return "Deshabilitado";
  return "Estado no disponible";
}

function formatDate(value: string | null): string {
  if (value === null) return "Sin fecha";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function preview(contact: ClinicMessageContact): string {
  return contact.lastMessage?.body || "Sin mensajes todavía.";
}

function updateAfterRead(current: ClinicMessagesData, contactUserId: number, updatedMessages: ClinicMessage[]): ClinicMessagesData {
  if (current.selectedContactId !== contactUserId) return current;
  const readById = new Map(updatedMessages.map((message) => [message.id, message]));
  const readCount = updatedMessages.length;
  return {
    ...current,
    messages: current.messages.map((message) => readById.get(message.id) ?? message),
    unread: Math.max(0, current.unread - readCount),
    contacts: current.contacts.map((contact) => contact.userId === contactUserId ? { ...contact, unread: Math.max(0, contact.unread - readCount) } : contact),
  };
}

export function ReceptionistMessages() {
  const [data, setData] = useState<ClinicMessagesData | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<ConversationTab>("all");
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { notice, showNotice } = useNotice();

  useEffect(() => {
    const controller = new AbortController();
    getClinicMessages(selectedId ?? undefined, controller.signal)
      .then((next) => {
        setData(next);
        setError(null);

        const unreadMessages = next.messages.filter((message) => message.isReceived && message.readAt === null);
        if (next.selectedContactId !== null && unreadMessages.length > 0) {
          void Promise.all(unreadMessages.map((message) => markClinicMessageRead(message.id)))
            .then((updatedMessages) => setData((current) => current === null ? current : updateAfterRead(current, next.selectedContactId!, updatedMessages)))
            .catch((reason: unknown) => {
              if (!isAbortError(reason)) showNotice(reason instanceof Error ? reason.message : "No pudimos actualizar el estado de lectura.");
            });
        }
      })
      .catch((reason: unknown) => {
        if (isAbortError(reason)) return;
        setError(reason instanceof Error ? reason.message : "No pudimos cargar los mensajes.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey, selectedId, showNotice]);

  const filteredContacts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es");
    return (data?.contacts ?? []).filter((contact) => {
      const matchesSearch = normalizedSearch.length === 0 || `${displayName(contact)} ${preview(contact)}`.toLocaleLowerCase("es").includes(normalizedSearch);
      const matchesTab = tab === "all" || tab === "unread" && contact.unread > 0 || tab === contact.kind;
      return matchesSearch && matchesTab;
    });
  }, [data?.contacts, search, tab]);

  const activeSelectedId = selectedId ?? data?.selectedContactId ?? null;
  const selected = data?.contacts.find((contact) => contact.userId === activeSelectedId) ?? null;
  const selectedMessages = activeSelectedId === null || data?.selectedContactId !== activeSelectedId ? [] : (data?.messages ?? []);

  function selectContact(userId: number): void {
    if (userId === activeSelectedId) return;
    setError(null);
    setIsLoading(true);
    setSelectedId(userId);
  }

  async function submitMessage(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const body = draft.trim();
    if (!selected || !body || isSending) return;
    setIsSending(true);
    try {
      const message = await sendClinicMessage({ recipientUserId: selected.userId, patientProfileId: selected.patientProfileId, body });
      setData((current) => current === null ? current : {
        ...current,
        messages: [...current.messages, message],
        contacts: current.contacts.map((contact) => contact.userId === selected.userId ? { ...contact, lastMessage: { body: message.body, createdAt: message.createdAt } } : contact),
      });
      setDraft("");
      showNotice("Mensaje enviado correctamente.");
    } catch (reason: unknown) {
      showNotice(reason instanceof Error ? reason.message : "No pudimos enviar el mensaje.");
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading && data === null) return <ClinicModuleLoading title="mensajes" description="Consultando contactos y conversaciones de la clínica." />;

  if (error !== null && data === null) {
    return <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7"><div role="alert"><SectionCard className="p-6"><h1 className="text-xl font-extrabold">No pudimos cargar los mensajes</h1><p className="mt-2 text-sm text-muted">{error}</p><button className="mt-4 min-h-10 rounded-lg bg-accent px-4 text-xs font-extrabold text-white hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-focus" type="button" onClick={() => { setError(null); setIsLoading(true); setReloadKey((current) => current + 1); }}>Reintentar</button></SectionCard></div></div>;
  }

  return <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
    <Notice message={notice} />
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Recepción · comunicación</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Mensajes</h1><p className="mt-1 text-xs text-muted">Comunícate con pacientes y equipo de la clínica.</p></div><span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-accent-soft px-3 text-[0.6rem] font-extrabold text-accent"><Mail className="size-3.5" aria-hidden="true" />Mensajería interna</span></header>

    <div className="mt-4 grid items-start gap-4 xl:grid-cols-[18rem_minmax(0,1fr)_17rem]">
      <SectionCard className="overflow-hidden"><div className="border-b border-line p-3"><label className="relative block"><span className="sr-only">Buscar conversaciones</span><Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" /><input aria-label="Buscar conversaciones" className="h-8 w-full rounded-lg border border-line bg-surface-input pr-2 pl-8 text-[0.62rem] outline-none focus:border-accent focus:ring-3 focus:ring-focus/20" placeholder="Buscar conversaciones..." value={search} onChange={(event) => setSearch(event.target.value)} /></label><div className="mt-3 flex gap-1 overflow-x-auto" role="group" aria-label="Filtrar conversaciones">{(["all", "unread", "patient", "team"] as const).map((item) => <button aria-pressed={tab === item} className={`min-h-8 shrink-0 rounded-md px-2 text-[0.55rem] font-bold ${tab === item ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-hover"}`} type="button" key={item} onClick={() => setTab(item)}>{item === "all" ? "Todas" : item === "unread" ? `No leídos (${data?.unread ?? 0})` : item === "patient" ? "Pacientes" : "Equipo"}</button>)}</div></div><div className="max-h-145 overflow-y-auto"><ul className="divide-y divide-line">{filteredContacts.map((contact) => <li key={contact.userId}><button aria-pressed={selected?.userId === contact.userId} className={`flex w-full gap-2.5 px-3 py-3 text-left transition-colors hover:bg-surface-hover ${selected?.userId === contact.userId ? "bg-accent-soft/60" : ""}`} type="button" onClick={() => selectContact(contact.userId)}><span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft font-mono text-[0.55rem] font-bold text-accent">{initials(displayName(contact))}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="truncate text-[0.63rem]">{displayName(contact)}</strong>{contact.unread > 0 ? <span className="grid size-4 shrink-0 place-items-center rounded-full bg-accent text-[0.48rem] font-bold text-white">{contact.unread}</span> : null}</span><span className="mt-1 block truncate text-[0.56rem] text-muted">{preview(contact)}</span><span className="mt-1 block text-[0.5rem] font-semibold text-muted">{kindLabel(contact.kind)} · {formatDate(contact.lastMessage?.createdAt ?? null)}</span></span></button></li>)}{filteredContacts.length === 0 ? <li className="p-6 text-center text-[0.6rem] font-semibold text-muted">{data?.contacts.length ? "No hay conversaciones que coincidan." : "No hay contactos disponibles en esta clínica."}</li> : null}</ul></div></SectionCard>

      <SectionCard className="flex min-h-145 flex-col overflow-hidden"><div className="flex items-center gap-3 border-b border-line px-4 py-3"><span className="grid size-9 place-items-center rounded-full bg-accent-soft font-mono text-[0.56rem] font-bold text-accent">{initials(displayName(selected))}</span><div className="min-w-0 flex-1"><h2 className="truncate text-xs font-extrabold">{displayName(selected)}</h2><p className="text-[0.55rem] text-muted">{selected ? `${kindLabel(selected.kind)} · ${statusLabel(selected)}` : "Selecciona una conversación"}</p></div></div><div className="flex-1 space-y-3 overflow-y-auto bg-paper/50 p-4" aria-live="polite"><p className="text-center text-[0.55rem] font-semibold text-muted">{isLoading ? "Actualizando conversación..." : selected ? "Mensajes de la conversación" : "Selecciona un contacto para comenzar"}</p>{selectedMessages.map((message) => <div className={`flex ${message.isReceived ? "justify-start" : "justify-end"}`} key={message.id}><div className={`max-w-[78%] rounded-xl px-3 py-2.5 text-[0.62rem] leading-relaxed ${message.isReceived ? "rounded-bl-sm bg-surface text-ink shadow-sm" : "rounded-br-sm bg-accent text-white"}`}><p>{message.body}</p><p className={`mt-1 text-[0.5rem] ${message.isReceived ? "text-muted" : "text-white/70"}`}>{formatDate(message.createdAt)}{message.isReceived ? "" : message.readAt ? " · Leído" : " · Enviado"}</p></div></div>)}{selected !== null && selectedMessages.length === 0 && !isLoading ? <div className="grid min-h-48 place-items-center text-center"><div><CircleUserRound className="mx-auto size-8 text-muted" aria-hidden="true" /><p className="mt-2 text-xs font-bold text-muted">Sin mensajes todavía.</p><p className="mt-1 text-[0.58rem] text-muted">Envía el primer mensaje a este contacto.</p></div></div> : null}</div><form className="border-t border-line p-3" onSubmit={submitMessage}><label className="sr-only" htmlFor="clinic-message-draft">Escribe un mensaje</label><div className="flex items-end gap-2"><textarea id="clinic-message-draft" className="min-h-11 flex-1 resize-y rounded-lg border border-line bg-surface-input px-3 py-2 text-[0.62rem] outline-none focus:border-accent focus:ring-3 focus:ring-focus/20 disabled:cursor-not-allowed disabled:opacity-60" placeholder={selected ? "Escribe un mensaje..." : "Selecciona un contacto"} value={draft} disabled={selected === null || isSending} onChange={(event) => setDraft(event.target.value)} /><button aria-label={isSending ? "Enviando mensaje" : "Enviar mensaje"} className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent text-white hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={selected === null || draft.trim().length === 0 || isSending}><Send className="size-4" aria-hidden="true" /></button></div></form></SectionCard>

      <aside className="grid gap-3"><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Información del contacto</h2><div className="mt-4 flex items-center gap-2.5"><span className="grid size-10 place-items-center rounded-full bg-ink font-mono text-[0.58rem] font-bold text-white">{initials(displayName(selected))}</span><div className="min-w-0"><strong className="block truncate text-[0.65rem]">{displayName(selected)}</strong>{selected ? <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[0.5rem] font-bold text-accent">{kindLabel(selected.kind)}</span> : null}</div></div>{selected ? <dl className="mt-4 grid gap-3 border-t border-line pt-3 text-[0.58rem]"><div className="flex items-center gap-2"><dt className="w-16 shrink-0 text-muted">Estado</dt><dd>{statusLabel(selected)}</dd></div><div className="flex items-center gap-2"><dt className="w-16 shrink-0 text-muted">Teléfono</dt><dd>{selected.phoneNumber ?? "No registrado"}</dd></div><div className="flex items-center gap-2"><dt className="w-16 shrink-0 text-muted">Correo</dt><dd className="truncate">{selected.email ?? "No registrado"}</dd></div>{selected.specialty ? <div className="flex items-center gap-2"><dt className="w-16 shrink-0 text-muted">Especialidad</dt><dd className="truncate">{selected.specialty}</dd></div> : null}</dl> : <p className="mt-4 text-[0.58rem] text-muted">Selecciona un contacto para consultar sus datos.</p>}</SectionCard><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Resumen de conversación</h2>{selected ? <ul className="mt-3 divide-y divide-line text-[0.58rem]"><li className="flex justify-between gap-2 py-2.5"><span className="text-muted">Mensajes cargados</span><strong>{selectedMessages.length}</strong></li><li className="flex justify-between gap-2 py-2.5"><span className="text-muted">No leídos</span><strong>{selected.unread}</strong></li><li className="flex justify-between gap-2 py-2.5"><span className="text-muted">Última actividad</span><strong>{formatDate(selected.lastMessage?.createdAt ?? null)}</strong></li></ul> : <p className="mt-3 text-[0.58rem] text-muted">No hay una conversación seleccionada.</p>}</SectionCard></aside>
    </div>
  </div>;
}
