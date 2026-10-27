import Image from "next/image";
import { LoaderCircle } from "lucide-react";

export default function PatientLoading() {
  return (
    <div
      className="patient-route-transition patient-route-transition--loading"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="patient-route-transition__card">
        <span className="patient-route-transition__logo" aria-hidden="true">
          <Image src="/logo_hipocratiq.webp" alt="" width={50} height={50} priority />
        </span>
        <div className="patient-route-transition__brand">HIPOCRATIQ</div>
        <div className="patient-route-transition__status">
          <LoaderCircle className="size-5 patient-route-transition__spinner" aria-hidden="true" />
          <strong>Cargando...</strong>
        </div>
        <div className="patient-route-transition__track" aria-hidden="true">
          <span />
        </div>
        <p>Preparando tu información de salud</p>
      </div>
    </div>
  );
}
