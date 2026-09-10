import { AlertCircle, Inbox } from "lucide-react";
import { DoctorCard } from "@/features/doctors/ui/doctor-primitives";
import { Spinner } from "@/shared/ui/spinner";

export function DoctorModuleLoading({ label }: Readonly<{ label: string }>) {
  return (
    <DoctorCard className="flex min-h-48 items-center justify-center p-6">
      <p className="flex items-center gap-2 text-xs font-bold text-muted" aria-busy="true">
        <Spinner className="size-4" />
        {label}
      </p>
    </DoctorCard>
  );
}

export function DoctorModuleError({ message }: Readonly<{ message: string }>) {
  return (
    <div role="alert">
      <DoctorCard className="p-6">
        <p className="flex items-center gap-2 text-xs font-bold text-danger">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {message}
        </p>
      </DoctorCard>
    </div>
  );
}

export function DoctorModuleEmpty({ message }: Readonly<{ message: string }>) {
  return (
    <div className="grid min-h-40 place-items-center px-6 py-10 text-center">
      <div>
        <Inbox className="mx-auto size-7 text-muted" aria-hidden="true" />
        <p className="mt-2 text-xs font-bold text-ink-secondary">{message}</p>
      </div>
    </div>
  );
}

export function DoctorModuleAlert({ children, tone = "error" }: Readonly<{ children: React.ReactNode; tone?: "error" | "success" }>) {
  return (
    <div className={`mb-4 rounded-lg border px-4 py-3 ${tone === "success" ? "border-success/30 bg-success-soft" : "border-danger/30 bg-danger-soft"}`} role={tone === "error" ? "alert" : "status"} aria-live={tone === "success" ? "polite" : undefined}>
      <p className={`text-xs font-bold ${tone === "success" ? "text-success" : "text-danger"}`}>{children}</p>
    </div>
  );
}
