import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getEmergencyPolicy } from "@/features/platform/api/server-emergency";
import { EmergencyPolicyView } from "@/features/platform/ui/emergency-policy-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("emergency");
  return { title: t("title") };
}

export default async function EmergencyPage() {
  const t = await getTranslations("emergency");
  const result = await getEmergencyPolicy();
  if (!result.ok) return <main className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-5"><section className="rounded-2xl border border-danger/25 bg-surface p-7 text-center" role="alert"><AlertTriangle className="mx-auto size-7 text-danger" aria-hidden="true" /><h1 className="mt-3 text-xl font-extrabold">{t("pageUnavailable")}</h1><p className="mt-2 text-sm text-muted">{result.message}</p></section></main>;
  return <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6"><EmergencyPolicyView initialData={result.data} /></div>;
}
