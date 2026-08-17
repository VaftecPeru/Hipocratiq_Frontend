"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Save } from "lucide-react";
import { getAdminPlatformSettings, updateAdminPlatformSettings } from "@/features/platform/api/browser-platform-settings";
import type { AiModel, LocaleCode, PlatformSettings } from "@/features/platform/model/platform-settings.types";
import { PLATFORM_SETTINGS_UPDATED_EVENT } from "@/features/platform/model/platform-settings.types";
import { SettingsCard, SettingsInput, SettingsSelect, SettingsToggle } from "@/features/platform/ui/settings-primitives";

const localeLabels: Record<LocaleCode, string> = { "es-MX": "Español (México)", "es-PE": "Español (Perú)", "en-US": "English (US)" };
const modelLabels: Record<AiModel, string> = { respiratory: "Respiratorio", dengue: "Dengue", gastrointestinal: "Gastrointestinal", hospital_occupancy: "Ocupación hospitalaria" };

function SaveButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return <button className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 text-xs font-bold text-white hover:bg-accent-hover disabled:opacity-55" disabled={loading} onClick={onClick} type="button"><Save className="size-3.5" />{loading ? "Guardando..." : "Guardar cambios"}</button>;
}

function Status({ value }: { value: string }) {
  return <p className="flex items-center gap-2 text-2xs text-muted" role="status" aria-live="polite">{value.startsWith("Error") ? <AlertTriangle className="size-3.5 text-danger" /> : <CheckCircle2 className="size-3.5 text-success" />}{value}</p>;
}

function useSettings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [status, setStatus] = useState("Cargando configuración...");
  useEffect(() => {
    const controller = new AbortController();
    getAdminPlatformSettings(controller.signal).then((data) => { setSettings(data); setStatus("Configuración cargada desde el backend."); }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("Error: no se pudo cargar la configuración.");
    });
    return () => controller.abort();
  }, []);
  return { settings, setSettings, status, setStatus };
}

export function BrandingSettingsForm() {
  const { settings, setSettings, status, setStatus } = useSettings();
  const [loading, setLoading] = useState(false);
  if (!settings) return <Status value={status} />;

  const save = async () => {
    setLoading(true); setStatus("Guardando identidad de plataforma...");
    try {
      const updated = await updateAdminPlatformSettings({ branding: settings.branding });
      setSettings(updated); setStatus("Identidad de plataforma guardada.");
      window.dispatchEvent(new Event(PLATFORM_SETTINGS_UPDATED_EVENT));
    } catch { setStatus("Error: no se pudo guardar la identidad."); } finally { setLoading(false); }
  };

  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]"><SettingsCard title="Identidad textual" description="Valores globales usados por soporte y metadatos de la plataforma." titleId="branding-form"><div className="mt-4 grid gap-3"><SettingsInput id="platform-name" label="Nombre de la plataforma" value={settings.branding.platformName} onChange={(platformName) => setSettings({ ...settings, branding: { ...settings.branding, platformName } })} /><SettingsInput id="support-email" label="Email de soporte" type="email" value={settings.branding.supportEmail} onChange={(supportEmail) => setSettings({ ...settings, branding: { ...settings.branding, supportEmail } })} /><SettingsInput id="support-url" label="URL de soporte" type="url" value={settings.branding.supportUrl} onChange={(supportUrl) => setSettings({ ...settings, branding: { ...settings.branding, supportUrl } })} /></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><Status value={status} /><SaveButton loading={loading} onClick={save} /></div></SettingsCard><SettingsCard title="Activos visuales" description="Logo, favicon e imagen de acceso." titleId="branding-assets"><div className="mt-4 rounded-lg border border-warning/25 bg-warning-soft/50 p-3 text-xs leading-5 text-muted"><p className="font-bold text-ink">Carga aún no disponible</p><p className="mt-1">Falta almacenamiento de objetos, validación de archivos y versionado de activos. Los controles ficticios fueron retirados.</p></div></SettingsCard></div>;
}

export function LocalizationSettingsForm() {
  const { settings, setSettings, status, setStatus } = useSettings();
  const [loading, setLoading] = useState(false);
  if (!settings) return <Status value={status} />;
  const enabledLocaleSet = new Set(settings.localization.enabledLocales);
  const toggleLocale = (locale: LocaleCode) => {
    const enabled = enabledLocaleSet.has(locale);
    const nextEnabledLocales = enabled ? settings.localization.enabledLocales.filter((item) => item !== locale) : [...settings.localization.enabledLocales, locale];
    if (!nextEnabledLocales.length || locale === settings.localization.defaultLocale && enabled) return;
    setSettings({ ...settings, localization: { ...settings.localization, enabledLocales: nextEnabledLocales } });
  };
  const save = async () => {
    setLoading(true); setStatus("Guardando idiomas...");
    try { const updated = await updateAdminPlatformSettings({ localization: settings.localization }); setSettings(updated); setStatus("Idiomas guardados."); }
    catch { setStatus("Error: no se pudieron guardar los idiomas."); } finally { setLoading(false); }
  };
  return <SettingsCard title="Idiomas disponibles" description="Catálogo de locales habilitados y locale predeterminado." titleId="localization-form"><div className="mt-4 grid gap-4 md:grid-cols-[1fr_20rem]"><fieldset className="grid gap-2"><legend className="mb-1 text-2xs font-bold text-muted">Locales habilitados</legend>{settings.localization.supportedLocales.map((locale) => <label className="flex items-center gap-2 rounded-lg border border-line bg-surface-subtle p-3 text-xs font-bold" key={locale}><input checked={enabledLocaleSet.has(locale)} className="size-4 accent-accent" onChange={() => toggleLocale(locale)} type="checkbox" />{localeLabels[locale]}<span className="ml-auto font-mono text-2xs text-muted">{locale}</span></label>)}</fieldset><div><SettingsSelect id="default-locale" label="Idioma predeterminado" value={localeLabels[settings.localization.defaultLocale]} options={settings.localization.enabledLocales.map((locale) => localeLabels[locale])} onChange={(label) => { const locale = settings.localization.enabledLocales.find((item) => localeLabels[item] === label); if (locale) setSettings({ ...settings, localization: { ...settings.localization, defaultLocale: locale } }); }} /><p className="mt-3 rounded-lg bg-accent-soft/60 p-3 text-2xs leading-5 text-muted">Los locales quedan persistidos. El catálogo de traducciones continúa en código fuente y requiere un pipeline versionado para edición de textos.</p></div></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><Status value={status} /><SaveButton loading={loading} onClick={save} /></div></SettingsCard>;
}

export function AiSettingsForm() {
  const { settings, setSettings, status, setStatus } = useSettings();
  const [loading, setLoading] = useState(false);
  if (!settings) return <Status value={status} />;
  const enabledModels = new Set(settings.ai.enabledModels);
  const toggleModel = (model: AiModel) => setSettings({ ...settings, ai: { ...settings.ai, enabledModels: enabledModels.has(model) ? settings.ai.enabledModels.filter((item) => item !== model) : [...settings.ai.enabledModels, model] } });
  const save = async () => {
    setLoading(true); setStatus("Guardando parámetros del motor...");
    try { const updated = await updateAdminPlatformSettings({ ai: settings.ai }); setSettings(updated); setStatus("Parámetros del motor guardados."); }
    catch { setStatus("Error: no se pudieron guardar los parámetros."); } finally { setLoading(false); }
  };
  return <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]"><SettingsCard title="Parámetros deseados del motor" description="Configuración persistente lista para ser consumida por el futuro servicio de inferencia." titleId="ai-form"><div className="mt-4 grid gap-3 sm:grid-cols-2"><SettingsSelect id="ai-frequency" label="Frecuencia" value={{ every_12_hours: "Cada 12 horas", daily: "Diaria", weekly: "Semanal" }[settings.ai.frequency]} options={["Cada 12 horas", "Diaria", "Semanal"]} onChange={(value) => setSettings({ ...settings, ai: { ...settings.ai, frequency: value === "Cada 12 horas" ? "every_12_hours" : value === "Semanal" ? "weekly" : "daily" } })} /><SettingsSelect id="ai-window" label="Ventana predictiva" value={`${settings.ai.windowDays} días`} options={["14 días", "30 días", "60 días"]} onChange={(value) => setSettings({ ...settings, ai: { ...settings.ai, windowDays: Number(value.split(" ")[0]) as 14 | 30 | 60 } })} /><SettingsSelect id="ai-sensitivity" label="Sensibilidad" value={{ low: "Baja", medium: "Media", high: "Alta" }[settings.ai.sensitivity]} options={["Baja", "Media", "Alta"]} onChange={(value) => setSettings({ ...settings, ai: { ...settings.ai, sensitivity: value === "Alta" ? "high" : value === "Baja" ? "low" : "medium" } })} /><div className="grid gap-1.5"><span className="text-2xs font-bold text-muted">Alertas automáticas</span><div className="flex h-9 items-center gap-2"><SettingsToggle checked={settings.ai.automaticAlerts} label="Alertas automáticas" onChange={(automaticAlerts) => setSettings({ ...settings, ai: { ...settings.ai, automaticAlerts } })} /><span className="text-2xs text-muted">{settings.ai.automaticAlerts ? "Activadas" : "Desactivadas"}</span></div></div></div><fieldset className="mt-4"><legend className="text-2xs font-bold text-muted">Modelos habilitados</legend><div className="mt-2 flex flex-wrap gap-2">{(Object.keys(modelLabels) as AiModel[]).map((model) => <label className={`cursor-pointer rounded-lg border px-3 py-2 text-2xs font-bold ${enabledModels.has(model) ? "border-accent bg-accent-soft text-accent" : "border-line text-muted"}`} key={model}><input checked={enabledModels.has(model)} className="sr-only" onChange={() => toggleModel(model)} type="checkbox" />{modelLabels[model]}</label>)}</div></fieldset><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><Status value={status} /><SaveButton loading={loading} onClick={save} /></div></SettingsCard><SettingsCard title="Capacidad operativa" description="Estado reportado por backend." titleId="ai-capability"><div className={`mt-4 rounded-lg border p-3 ${settings.aiCapabilities.status === "configured" ? "border-success/25 bg-success-soft/50" : "border-warning/25 bg-warning-soft/50"}`}><p className="text-xs font-extrabold">{settings.aiCapabilities.status === "configured" ? "Proveedor declarado" : "Servicio no configurado"}</p><p className="mt-1 text-2xs leading-5 text-muted">Proveedor: {settings.aiCapabilities.provider ?? "ninguno"}. Predicciones reales: {settings.aiCapabilities.predictionsAvailable ? "disponibles" : "no disponibles"}.</p></div><div className="mt-3 rounded-lg border border-dashed border-line p-5 text-center text-2xs text-muted">Sin fuentes epidemiológicas conectadas ni predicciones verificadas.</div></SettingsCard></div>;
}
