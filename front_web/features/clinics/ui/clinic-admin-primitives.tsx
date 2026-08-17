"use client";

import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export function AdminMetric({ icon: Icon, label, value, helper, tone, badge }: Readonly<{ icon: LucideIcon; label: string; value: string; helper?: string; tone: string; badge?: string }>) {
  return (
    <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)] motion-safe:animate-[fade-up-in_380ms_ease-out_both]">
      <div className="flex items-start gap-3">
        <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tone}`}><Icon className="size-4" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1"><p className="text-2xs font-bold text-muted">{label}</p><p className="mt-1 font-mono text-xl font-bold tracking-[-0.04em]">{value}</p></div>
        {badge ? <span className="rounded-full bg-success-soft px-2 py-1 text-[0.54rem] font-extrabold text-success">{badge}</span> : null}
      </div>
      {helper ? <p className="mt-3 border-t border-line pt-2 text-[0.58rem] font-semibold text-muted">{helper}</p> : null}
    </article>
  );
}

export function SectionCard({ children, className = "", labelledBy }: Readonly<{ children: React.ReactNode; className?: string; labelledBy?: string }>) {
  return <section className={`rounded-xl border border-line bg-surface shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)] ${className}`} aria-labelledby={labelledBy}>{children}</section>;
}

export function useNotice() {
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const showNotice = useCallback((message: string) => {
    setNotice(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), 2400);
  }, []);
  return { notice, showNotice };
}

export function Notice({ message }: Readonly<{ message: string | null }>) {
  return message ? <div className="fixed right-4 bottom-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl bg-ink px-4 py-3 text-xs font-bold text-white shadow-xl" role="status"><Check className="size-4 shrink-0 text-success" />{message}</div> : null;
}

export function Toggle({ checked, onChange, label }: Readonly<{ checked: boolean; onChange: (checked: boolean) => void; label: string }>) {
  return <button className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-3 focus-visible:outline-focus ${checked ? "bg-success" : "bg-line-strong"}`} type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}><span className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "left-6" : "left-1"}`} /></button>;
}
