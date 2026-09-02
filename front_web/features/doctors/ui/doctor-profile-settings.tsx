"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Mail, PenLine, Phone, Stethoscope, UserRound } from "lucide-react";
import { getDoctorRegistrationSpecialties, type RegistrationSpecialty } from "@/features/auth/api/doctor-registration";
import { getDoctorProfile, updateDoctorProfile, type DoctorProfile } from "@/features/doctors/api/doctor-profile";
import { DoctorCard } from "@/features/doctors/ui/doctor-primitives";

function ProfileRow({ icon: Icon, label, value }: Readonly<{ icon: typeof UserRound; label: string; value: string }>) {
  return <div className="flex min-h-10 items-center gap-2 border-b border-line last:border-0"><Icon className="size-3.5 shrink-0 text-ink-secondary" aria-hidden="true" /><span className="min-w-0 flex-1 text-[0.58rem] font-extrabold text-ink-secondary">{label}</span><span className="max-w-[58%] truncate text-right text-[0.58rem] font-extrabold text-ink">{value}</span></div>;
}

export function DoctorProfileSettings() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [specialties, setSpecialties] = useState<RegistrationSpecialty[]>([]);
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", medicalLicense: "", specialtyId: "", subspecialtyId: "" });

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getDoctorProfile(controller.signal), getDoctorRegistrationSpecialties()])
      .then(([nextProfile, catalog]) => {
        setProfile(nextProfile);
        setSpecialties(catalog.data);
        setForm({ name: nextProfile.name, email: nextProfile.email ?? "", phoneNumber: nextProfile.phoneNumber, medicalLicense: nextProfile.medicalLicense, specialtyId: String(nextProfile.specialtyId ?? ""), subspecialtyId: String(nextProfile.subspecialtyId ?? "") });
      })
      .catch((caught: unknown) => { if (!(caught instanceof DOMException && caught.name === "AbortError")) setError(caught instanceof Error ? caught.message : "No pudimos cargar tu perfil médico."); });
    return () => controller.abort();
  }, []);

  const selectedSpecialty = useMemo(() => specialties.find((specialty) => specialty.id === Number(form.specialtyId)), [form.specialtyId, specialties]);

  async function save(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true); setError(null);
    try {
      const nextProfile = await updateDoctorProfile({ name: form.name.trim(), email: form.email.trim(), phoneNumber: form.phoneNumber.trim(), medicalLicense: form.medicalLicense.trim(), specialtyId: form.specialtyId ? Number(form.specialtyId) : null, subspecialtyId: form.subspecialtyId ? Number(form.subspecialtyId) : null });
      setProfile(nextProfile); setEditing(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos actualizar tu perfil médico.");
    } finally { setPending(false); }
  }

  if (error && !profile) return <DoctorCard className="p-4"><p className="text-xs font-bold text-danger" role="alert">{error}</p></DoctorCard>;
  if (!profile) return <DoctorCard className="p-4"><p className="text-xs font-bold text-muted" aria-busy="true">Cargando perfil profesional…</p></DoctorCard>;

  return <DoctorCard className="p-4"><div className="flex items-center gap-2 border-b border-line pb-3"><span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent"><UserRound className="size-4" aria-hidden="true" /></span><h2 className="text-[0.82rem] font-extrabold">Perfil profesional</h2></div>{editing ? <form className="mt-3 grid gap-2" onSubmit={save} aria-busy={pending}><label className="grid gap-1 text-[0.58rem] font-bold text-ink-secondary">Nombre<input className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label className="grid gap-1 text-[0.58rem] font-bold text-ink-secondary">Correo<input className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label className="grid gap-1 text-[0.58rem] font-bold text-ink-secondary">Teléfono<input className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink" value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} required /></label><label className="grid gap-1 text-[0.58rem] font-bold text-ink-secondary">Licencia<input className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink" value={form.medicalLicense} onChange={(event) => setForm({ ...form, medicalLicense: event.target.value })} required /></label><label className="grid gap-1 text-[0.58rem] font-bold text-ink-secondary">Especialidad<select className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink" value={form.specialtyId} onChange={(event) => setForm({ ...form, specialtyId: event.target.value, subspecialtyId: "" })} required><option value="">Selecciona una especialidad</option>{specialties.map((specialty) => <option key={specialty.id} value={specialty.id}>{specialty.name}</option>)}</select></label><label className="grid gap-1 text-[0.58rem] font-bold text-ink-secondary">Subespecialidad<select className="h-9 rounded-lg border border-line bg-surface-input px-2 text-xs text-ink" value={form.subspecialtyId} disabled={!selectedSpecialty} onChange={(event) => setForm({ ...form, subspecialtyId: event.target.value })}><option value="">Sin subespecialidad</option>{selectedSpecialty?.subspecialties.map((subspecialty) => <option key={subspecialty.id} value={subspecialty.id}>{subspecialty.name}</option>)}</select></label>{error ? <p className="text-[0.58rem] font-bold text-danger" role="alert">{error}</p> : null}<div className="flex gap-2"><button className="mt-1 inline-flex min-h-8 items-center gap-2 rounded-lg bg-accent px-3 text-[0.59rem] font-extrabold text-white disabled:opacity-50" type="submit" disabled={pending}>Guardar</button><button className="mt-1 inline-flex min-h-8 items-center gap-2 rounded-lg border border-line px-3 text-[0.59rem] font-extrabold" type="button" onClick={() => setEditing(false)}>Cancelar</button></div></form> : <><div className="mt-1"><ProfileRow icon={UserRound} label="Nombre" value={profile.name} /><ProfileRow icon={Stethoscope} label="Especialidad" value={profile.specialty} /><ProfileRow icon={FileText} label="Cédula" value={profile.medicalLicense} /><ProfileRow icon={Mail} label="Correo" value={profile.email ?? "Sin correo"} /><ProfileRow icon={Phone} label="Teléfono" value={profile.phoneNumber} /></div><button className="mt-3 inline-flex min-h-8 items-center gap-2 rounded-lg border border-accent/20 px-3 text-[0.59rem] font-extrabold text-accent focus-visible:outline-3 focus-visible:outline-focus" type="button" onClick={() => setEditing(true)}><PenLine className="size-3.5" aria-hidden="true" />Editar perfil</button></>}</DoctorCard>;
}
