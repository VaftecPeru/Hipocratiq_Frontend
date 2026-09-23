"use client";

import { Building2, ClipboardList, Save, Send, ShieldAlert, Workflow } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { publishEmergencyPolicy, updateEmergencyPolicy } from "@/features/platform/api/browser-emergency";
import type { EmergencyPolicy, EmergencyPolicyData } from "@/features/platform/model/emergency.types";
import { FilterSelect } from "@/shared/ui/filter-select";
import { Modal } from "@/shared/ui/modal";
import { ModalField, ModalPrimaryButton, ModalSecondaryButton } from "@/shared/ui/modal-parts";

const fieldClass = "h-10 w-full rounded-lg border border-line bg-surface px-3 text-xs text-ink outline-none focus:border-accent focus:ring-3 focus:ring-focus/40";
const dateFormatters = {
  es: new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }),
  en: new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }),
};
let responsibleKeyCounter = 0;

function newResponsibleKey(): string {
  responsibleKeyCounter += 1;
  return `global-responsible-${responsibleKeyCounter}`;
}

function formatDate(value: string | null, locale: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatters[locale.toLowerCase().startsWith("en") ? "en" : "es"].format(date);
}

export function EmergencyPolicyView({ initialData }: { initialData: EmergencyPolicyData }) {
  const locale = useLocale();
  const t = useTranslations("emergency");
  const [data, setData] = useState(initialData);
  const [policy, setPolicy] = useState(initialData.policy);
  const [responsibles, setResponsibles] = useState(initialData.responsibles);
  const [responsibleRowKeys, setResponsibleRowKeys] = useState<string[]>(() => initialData.responsibles.map(() => newResponsibleKey()));
  const [publishOpen, setPublishOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function updatePolicy<K extends keyof EmergencyPolicy>(key: K, value: EmergencyPolicy[K]) {
    setPolicy((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const updated = await updateEmergencyPolicy(policy, responsibles);
      setData(updated);
      setPolicy(updated.policy);
      setResponsibles(updated.responsibles);
      setResponsibleRowKeys(updated.responsibles.map(() => newResponsibleKey()));
       setNotice(t("savedNotice"));
     } catch (requestError: unknown) {
       setError(requestError instanceof Error ? requestError.message : t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
           <p className="text-2xs font-extrabold tracking-[0.14em] text-danger uppercase">{t("eyebrow")}</p>
           <h1 className="mt-1 text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold">{t("title")}</h1>
           <p className="mt-1 max-w-3xl text-xs text-muted">{t("description")}</p>
        </div>
        <div className="flex gap-2">
           <Link className="flex min-h-11 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-bold sm:min-h-9" href="/audit"><ClipboardList className="size-3.5" aria-hidden="true" />{t("audit")}</Link>
           <button className="flex min-h-11 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-9" type="button" disabled={saving} onClick={() => setPublishOpen(true)}><Send className="size-3.5" aria-hidden="true" />{t("publish")}</button>
        </div>
      </div>

       <section className="mt-4 grid gap-3 sm:grid-cols-3" aria-label={t("statsLabel")}>
         <Stat label={t("activeClinics")} value={data.stats.activeClinics} icon={Building2} />
         <Stat label={t("enabledPolicy")} value={data.stats.enabledClinics} icon={ShieldAlert} />
         <Stat label={t("changesToday")} value={data.stats.policyChangesToday} icon={Workflow} />
      </section>

      <section className="mt-4 rounded-xl border border-danger/25 bg-danger-soft/60 p-4" aria-labelledby="emergency-publication-title" role="status">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
           <div><h2 className="text-sm font-extrabold text-danger" id="emergency-publication-title">{t("publicationTitle")}</h2><p className="mt-1 text-2xs text-ink">{t("publicationDescription")}</p></div>
           <span className="w-fit rounded-full bg-danger px-2.5 py-1 text-2xs font-extrabold text-white">{data.publication ? t("activeOverride") : t("noPublication")}</span>
         </div>
         {data.publication ? <dl className="mt-3 grid gap-2 text-2xs sm:grid-cols-3"><div><dt className="font-bold text-muted">{t("scope")}</dt><dd className="mt-0.5 font-extrabold">{t("allClinics")}</dd></div><div><dt className="font-bold text-muted">{t("published")}</dt><dd className="mt-0.5 font-extrabold">{formatDate(data.publication.publishedAt, locale)}</dd></div><div><dt className="font-bold text-muted">{t("responsibles")}</dt><dd className="mt-0.5 font-extrabold">{t("responsibleCount", { count: data.publication.responsibles.length })}</dd></div></dl> : <p className="mt-3 text-2xs font-semibold text-muted">{t("publishHint")}</p>}
      </section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
             <div><h2 className="text-sm font-extrabold">{t("globalPolicy")}</h2><p className="mt-0.5 text-2xs text-muted">{t("backendConfiguration")}</p></div>
             <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={policy.enabled} onChange={(event) => updatePolicy("enabled", event.target.checked)} />{t("enabled")}</label>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
             <ModalField id="global-emergency-label" label={t("buttonLabel")} value={policy.label} onChange={(event) => updatePolicy("label", event.target.value)} maxLength={60} />
             <Select label={t("visibility")} value={policy.visibility} onChange={(value) => updatePolicy("visibility", value as EmergencyPolicy["visibility"])} options={[["reception_doctors_admins", t("visibilityOptions.receptionDoctorsAdmins")], ["doctors_admins", t("visibilityOptions.doctorsAdmins")], ["admins_only", t("visibilityOptions.adminsOnly")]]} />
             <Select label={t("color")} value={policy.color} onChange={(value) => updatePolicy("color", value as EmergencyPolicy["color"])} options={[["#EF2F3F", t("colorOptions.red")], ["#F97316", t("colorOptions.orange")], ["#7C3AED", t("colorOptions.violet")]]} />
             <Select label={t("inheritance")} value={policy.inheritance} onChange={(value) => updatePolicy("inheritance", value as EmergencyPolicy["inheritance"])} options={[["workflow_and_responsibles", t("inheritanceOptions.workflow")], ["responsibles_only", t("inheritanceOptions.responsibles")], ["locked", t("inheritanceOptions.locked")]]} />
             <Select label={t("defaultChannel")} value={policy.defaultChannel} onChange={(value) => updatePolicy("defaultChannel", value as EmergencyPolicy["defaultChannel"])} options={[["priority_push", t("channelOptions.priorityPush")], ["internal_alert", t("channelOptions.internalAlert")], ["email", t("channelOptions.email")], ["sms", t("channelOptions.sms")]]} />
             <Select label={t("escalationAfter")} value={String(policy.escalationMinutes)} onChange={(value) => updatePolicy("escalationMinutes", Number(value) as EmergencyPolicy["escalationMinutes"])} options={[["1", t("minute", { count: 1 })], ["3", t("minute", { count: 3 })], ["5", t("minute", { count: 5 })], ["10", t("minute", { count: 10 })]]} />
          </div>
        </article>

        <article className="rounded-xl border border-line bg-surface p-4">
           <h2 className="text-sm font-extrabold">{t("defaultResponsibles")}</h2>
           <p className="mt-0.5 text-2xs text-muted">{t("newClinicTemplate")}</p>
          <div className="mt-4 grid gap-3">
            {responsibles.map((responsible, index) => (
              <div className="grid gap-2 rounded-lg border border-line p-3 sm:grid-cols-2" key={responsibleRowKeys[index] ?? responsible.role}>
                 <label className="grid gap-1 text-2xs font-bold text-muted" htmlFor={`global-emergency-role-${responsibleRowKeys[index] ?? index}`}>{t("role")}<input id={`global-emergency-role-${responsibleRowKeys[index] ?? index}`} className={fieldClass} value={responsible.role} onChange={(event) => setResponsibles((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, role: event.target.value } : item))} /></label>
                 <label className="grid gap-1 text-2xs font-bold text-muted" htmlFor={`global-emergency-channel-${responsibleRowKeys[index] ?? index}`}>{t("channelAction")}<input id={`global-emergency-channel-${responsibleRowKeys[index] ?? index}`} className={fieldClass} value={responsible.channel} onChange={(event) => setResponsibles((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, channel: event.target.value } : item))} /></label>
              </div>
            ))}
          </div>
        </article>
      </section>

      {error ? <p className="mt-3 rounded-lg bg-danger-soft p-3 text-xs text-danger" role="alert">{error}</p> : null}
      {notice ? <p className="mt-3 rounded-lg bg-success-soft p-3 text-xs text-success" role="status">{notice}</p> : null}
       <div className="mt-4 flex justify-end"><button className="flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10" type="button" disabled={saving} onClick={() => void save()}><Save className="size-4" aria-hidden="true" />{saving ? t("saving") : t("save")}</button></div>
       <PublishModal isOpen={publishOpen} onClose={() => setPublishOpen(false)} onPublished={(affected, publishedAt, note) => { setData((current) => ({ ...current, publishedAt, publication: { scope: "all", force: true, note: note || null, publishedAt, publishedBy: null, policy: current.policy, responsibles: current.responsibles } })); setNotice(t("publishedForClinics", { count: affected })); }} />
    </>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Building2 }) {
  return <article className="rounded-xl border border-line bg-surface p-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-accent-soft text-accent"><Icon className="size-4" aria-hidden="true" /></span><div><p className="text-2xs font-bold text-muted">{label}</p><p className="font-mono text-xl font-bold">{value}</p></div></div></article>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[][]; onChange: (value: string) => void }) {
  return <FilterSelect label={label} value={value} options={options.map(([option, text]) => ({ value: option, label: text }))} onChange={onChange} density="form" />;
}

function PublishModal({ isOpen, onClose, onPublished }: { isOpen: boolean; onClose: () => void; onPublished: (affected: number, publishedAt: string, note: string) => void }) {
  const t = useTranslations("emergency.publishModal");
  const [note, setNote] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function publish() {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const key = idempotencyKey ?? crypto.randomUUID();
      setIdempotencyKey(key);
      const result = await publishEmergencyPolicy({ note, idempotencyKey: key });
      onPublished(result.affectedClinics, result.publishedAt, note);
      setNote("");
      setIdempotencyKey(null);
      onClose();
       } catch (requestError: unknown) {
       setError(requestError instanceof Error ? requestError.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

   function close() {
     if (loading) return;
     setIdempotencyKey(null);
     setError(null);
     onClose();
   }

   return <Modal isOpen={isOpen} onClose={close} size="md" title={t("title")} description={t("description")} footer={<><ModalSecondaryButton onClick={close} disabled={loading}>{t("cancel")}</ModalSecondaryButton><ModalPrimaryButton onClick={() => void publish()} disabled={loading}>{loading ? t("publishing") : t("publishAll")}</ModalPrimaryButton></>}><div className="space-y-4"><p className="rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger" role="note">{t("warning")}</p><ModalField id="publish-note" label={t("noteLabel")} value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} />{error ? <p className="rounded-lg bg-danger-soft p-3 text-xs text-danger" role="alert">{error}</p> : null}</div></Modal>;
}
