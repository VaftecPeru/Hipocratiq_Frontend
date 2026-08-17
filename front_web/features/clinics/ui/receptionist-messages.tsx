"use client";

import {
  ArrowDown,
  Check,
  CircleUserRound,
  Mail,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getClinicMembers, getClinicPatients } from "@/features/clinics/api/browser-clinic-dashboard";
import type { ClinicPatient, ClinicTeamMember } from "@/features/clinics/model/clinic-admin.types";
import { Notice, SectionCard, useNotice } from "./clinic-admin-primitives";

type ConversationKind = "Paciente" | "Equipo";
type Conversation = {
  id: string;
  name: string;
  kind: ConversationKind;
  preview: string;
  time: string;
  unread: number;
  online: boolean;
  phone?: string | null;
};
type Message = { id: string; body: string; time: string; mine: boolean };

const seedConversations: Conversation[] = [
  { id: "patient-1", name: "María López García", kind: "Paciente", preview: "Hola, ¿podrían confirmarme la hora...", time: "10:15 AM", unread: 2, online: true, phone: "+51 987 654 321" },
  { id: "patient-2", name: "Juan Pérez Ruiz", kind: "Paciente", preview: "Gracias por la información, estaré...", time: "09:48 AM", unread: 1, online: false, phone: "+51 987 654 322" },
  { id: "team-1", name: "Dr. Carlos Ruiz", kind: "Equipo", preview: "Por favor revisar el resultado del estudio.", time: "09:30 AM", unread: 0, online: true },
  { id: "patient-3", name: "Sofía Ramos", kind: "Paciente", preview: "¿Cuándo estarán listos mis resultados?", time: "Ayer", unread: 0, online: true, phone: "+51 987 654 323" },
  { id: "team-2", name: "Dra. Ana Gómez", kind: "Equipo", preview: "Perfecto, lo veo en la próxima reunión.", time: "Ayer", unread: 0, online: false },
];

const seedMessages: Record<string, Message[]> = {
  "patient-1": [
    { id: "m-1", body: "Hola, buenas tardes. ¿Podrían confirmarme la hora de mi cita de mañana?", time: "10:12 AM", mine: false },
    { id: "m-2", body: "¡Hola María! Claro que sí, tu cita es mañana a las 10:30 AM con el Dr. Carlos Ruiz (Cardiología).", time: "10:13 AM · OK", mine: true },
    { id: "m-3", body: "Perfecto, muchas gracias.", time: "10:14 AM", mine: false },
    { id: "m-4", body: "De nada, estamos para ayudarte. Si necesitas algo más, aquí estamos.", time: "10:15 AM · OK", mine: true },
    { id: "m-5", body: "Excelente servicio, gracias.", time: "10:15 AM", mine: false },
  ],
};

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function avatarClass(index: number): string {
  return index % 2 === 0 ? "bg-accent-soft text-accent" : "bg-violet-soft text-violet";
}

function mapPatientConversation(patient: ClinicPatient, index: number): Conversation {
  return {
    id: `patient-${patient.id}`,
    name: patient.name ?? "Paciente sin nombre",
    kind: "Paciente",
    preview: "Paciente registrado recientemente.",
    time: index === 0 ? "Ahora" : "Hoy",
    unread: 0,
    online: false,
    phone: patient.phoneNumber,
  };
}

function mapTeamConversation(member: ClinicTeamMember): Conversation {
  return {
    id: `team-${member.id}`,
    name: member.name,
    kind: "Equipo",
    preview: member.specialty ?? "Equipo clínico",
    time: "Hoy",
    unread: 0,
    online: member.status === "active",
  };
}

export function ReceptionistMessages() {
  const [conversations, setConversations] = useState(seedConversations);
  const [selectedId, setSelectedId] = useState("patient-1");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"Todas" | "No leídos" | ConversationKind>("Todas");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(seedMessages);
  const { notice, showNotice } = useNotice();

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getClinicPatients("", 1, controller.signal), getClinicMembers(controller.signal)])
      .then(([patients, members]) => {
        const patientConversations = patients.patients.slice(0, 6).map(mapPatientConversation);
        const teamConversations = members.filter((member) => member.role === "doctor").slice(0, 4).map(mapTeamConversation);
        setConversations((current) => {
          const merged = [...current, ...patientConversations, ...teamConversations];
          return Array.from(new Map(merged.map((conversation) => [conversation.id, conversation])).values());
        });
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) showNotice(error instanceof Error ? error.message : "No pudimos cargar las conversaciones.");
      });
    return () => controller.abort();
  }, [showNotice]);

  const filteredConversations = useMemo(() => conversations.filter((conversation) => {
    const matchesSearch = `${conversation.name} ${conversation.preview}`.toLocaleLowerCase("es").includes(search.trim().toLocaleLowerCase("es"));
    const matchesTab = tab === "Todas" || tab === "No leídos" && conversation.unread > 0 || tab === conversation.kind;
    return matchesSearch && matchesTab;
  }), [conversations, search, tab]);
  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0];
  const selectedMessages = selected ? messages[selected.id] ?? [] : [];

  function sendMessage(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !selected) return;
    const message: Message = { id: `${selected.id}-${Date.now()}`, body, time: "Ahora · OK", mine: true };
    setMessages((current) => ({ ...current, [selected.id]: [...(current[selected.id] ?? []), message] }));
    setConversations((current) => current.map((conversation) => conversation.id === selected.id ? { ...conversation, preview: body, time: "Ahora" } : conversation));
    setDraft("");
    showNotice("Mensaje preparado para enviar.");
  }

  return <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
    <Notice message={notice} />
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Recepción · comunicación</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Mensajes</h1><p className="mt-1 text-xs text-muted">Comunícate con pacientes, médicos y el equipo de la clínica.</p></div><span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-success-soft px-3 text-[0.6rem] font-extrabold text-success"><span className="size-1.5 rounded-full bg-success" />Canal interno activo</span></header>

    <div className="mt-4 grid items-start gap-4 xl:grid-cols-[18rem_minmax(0,1fr)_17rem]">
      <SectionCard className="overflow-hidden"><div className="border-b border-line p-3"><label className="relative block"><span className="sr-only">Buscar conversaciones</span><Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" /><input className="h-8 w-full rounded-lg border border-line bg-surface-input pr-2 pl-8 text-[0.62rem] outline-none focus:border-accent" placeholder="Buscar conversaciones..." value={search} onChange={(event) => setSearch(event.target.value)} /></label><div className="mt-3 flex gap-1 overflow-x-auto">{(["Todas", "No leídos", "Paciente", "Equipo"] as const).map((item) => <button className={`min-h-7 shrink-0 rounded-md px-2 text-[0.55rem] font-bold ${tab === item ? "bg-accent-soft text-accent" : "text-muted"}`} type="button" key={item} onClick={() => setTab(item)}>{item}{item === "No leídos" ? " 2" : ""}</button>)}</div></div><ul className="divide-y divide-line">{filteredConversations.map((conversation, index) => <li key={conversation.id}><button className={`flex w-full gap-2.5 px-3 py-3 text-left transition-colors hover:bg-surface-hover ${selected?.id === conversation.id ? "bg-accent-soft/60" : ""}`} type="button" onClick={() => setSelectedId(conversation.id)}><span className={`relative grid size-9 shrink-0 place-items-center rounded-full font-mono text-[0.55rem] font-bold ${avatarClass(index)}`}>{initials(conversation.name)}{conversation.online ? <span className="absolute right-0 bottom-0 size-2 rounded-full border-2 border-surface bg-success" /> : null}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="truncate text-[0.63rem]">{conversation.name}</strong><time className="shrink-0 text-[0.5rem] text-muted">{conversation.time}</time></span><span className="mt-1 block truncate text-[0.56rem] text-muted">{conversation.preview}</span></span>{conversation.unread > 0 ? <span className="grid size-4 shrink-0 place-items-center rounded-full bg-accent text-[0.5rem] font-bold text-white">{conversation.unread}</span> : null}</button></li>)}</ul>{filteredConversations.length === 0 ? <p className="p-5 text-center text-xs text-muted">No hay conversaciones.</p> : null}<button className="m-3 flex min-h-8 w-[calc(100%-1.5rem)] items-center justify-center rounded-lg bg-surface-subtle text-[0.58rem] font-extrabold text-accent" type="button" onClick={() => showNotice("Mostrando todas las conversaciones.")}>Ver todas las conversaciones</button></SectionCard>

      <SectionCard className="flex min-h-145 flex-col overflow-hidden"><div className="flex items-center gap-3 border-b border-line px-4 py-3"><span className="grid size-9 place-items-center rounded-full bg-accent-soft font-mono text-[0.56rem] font-bold text-accent">{initials(selected?.name ?? "")}</span><div className="min-w-0 flex-1"><h2 className="truncate text-xs font-extrabold">{selected?.name ?? "Selecciona una conversación"}</h2><p className="text-[0.55rem] text-muted">{selected?.kind} · {selected?.online ? "En línea" : "ID: " + (selected?.id ?? "-")}</p></div><button className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:bg-surface-hover" type="button" aria-label="Llamar" onClick={() => showNotice("Llamada disponible en la integración de comunicaciones.")}><Phone className="size-3.5" aria-hidden="true" /></button><button className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:bg-surface-hover" type="button" aria-label="Videollamada" onClick={() => showNotice("Videollamada disponible próximamente.")}><Video className="size-3.5" aria-hidden="true" /></button></div><div className="flex-1 space-y-3 overflow-y-auto bg-paper/50 p-4"><p className="text-center text-[0.55rem] font-semibold text-muted">Hoy</p>{selectedMessages.map((message) => <div className={`flex ${message.mine ? "justify-end" : "justify-start"}`} key={message.id}><div className={`max-w-[78%] rounded-xl px-3 py-2.5 text-[0.62rem] leading-relaxed ${message.mine ? "rounded-br-sm bg-accent text-white" : "rounded-bl-sm bg-surface text-ink shadow-sm"}`}><p>{message.body}</p><p className={`mt-1 text-[0.5rem] ${message.mine ? "text-white/70" : "text-muted"}`}>{message.time}</p></div></div>)}{selectedMessages.length === 0 ? <div className="grid min-h-48 place-items-center text-center"><div><CircleUserRound className="mx-auto size-8 text-muted" aria-hidden="true" /><p className="mt-2 text-xs font-bold text-muted">Sin mensajes todavía.</p><p className="mt-1 text-[0.58rem] text-muted">Inicia la conversación desde recepción.</p></div></div> : null}</div><form className="flex items-center gap-2 border-t border-line p-3" onSubmit={sendMessage}><button className="grid size-8 place-items-center rounded-lg text-muted hover:bg-accent-soft hover:text-accent" type="button" aria-label="Adjuntar archivo" onClick={() => showNotice("Adjuntos disponibles con el expediente digital.")}><Paperclip className="size-3.5" aria-hidden="true" /></button><input className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-surface-input px-3 text-[0.62rem] outline-none focus:border-accent" placeholder="Escribe un mensaje..." value={draft} onChange={(event) => setDraft(event.target.value)} disabled={!selected} /><button className="grid size-9 place-items-center rounded-lg bg-accent text-white disabled:opacity-40" type="submit" aria-label="Enviar mensaje" disabled={!draft.trim() || !selected}><Send className="size-3.5" aria-hidden="true" /></button></form></SectionCard>

      <aside className="grid gap-3"><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Información del contacto</h2><div className="mt-4 flex items-center gap-2.5"><span className="grid size-10 place-items-center rounded-full bg-ink font-mono text-[0.58rem] font-bold text-white">{initials(selected?.name ?? "")}</span><div className="min-w-0"><strong className="block truncate text-[0.65rem]">{selected?.name}</strong><span className="rounded-full bg-success-soft px-1.5 py-0.5 text-[0.5rem] font-bold text-success">{selected?.kind}</span></div></div><dl className="mt-4 grid gap-3 border-t border-line pt-3 text-[0.58rem]"><div className="flex items-center gap-2"><Phone className="size-3.5 text-muted" aria-hidden="true" /><dt className="sr-only">Teléfono</dt><dd>{selected?.phone ?? "Teléfono no registrado"}</dd></div><div className="flex items-center gap-2"><Mail className="size-3.5 text-muted" aria-hidden="true" /><dt className="sr-only">Correo</dt><dd className="truncate">Correo no registrado</dd></div></dl></SectionCard><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Historial de la conversación</h2><ul className="mt-3 divide-y divide-line text-[0.58rem]"><li className="flex gap-2 py-2.5"><span className="grid size-6 place-items-center rounded-md bg-surface-subtle"><Check className="size-3 text-success" /></span><span><b className="block">Primera consulta</b><span className="text-muted">Perfil creado en clínica</span></span></li><li className="flex gap-2 py-2.5"><span className="grid size-6 place-items-center rounded-md bg-accent-soft"><Mail className="size-3 text-accent" /></span><span><b className="block">Último mensaje</b><span className="text-muted">Actualizado hoy</span></span></li></ul><button className="mt-2 flex min-h-8 w-full items-center justify-center gap-1 rounded-lg bg-surface-subtle text-[0.58rem] font-extrabold text-accent" type="button" onClick={() => showNotice("Historial completo disponible próximamente.")}>Ver historial completo <ArrowDown className="size-3 -rotate-90" aria-hidden="true" /></button></SectionCard><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Notas rápidas</h2><div className="mt-3 rounded-lg border border-warning/30 bg-warning-soft/40 p-3 text-[0.56rem] text-ink-secondary">Paciente puede necesitar confirmación de cita antes de las 5 PM.</div><button className="mt-2 flex min-h-8 w-full items-center justify-center gap-1 rounded-lg bg-surface-subtle text-[0.58rem] font-extrabold text-accent" type="button" onClick={() => showNotice("Nota agregada al expediente.")}><Plus className="size-3" aria-hidden="true" />Agregar nota</button></SectionCard></aside>
    </div>
  </div>;
}
