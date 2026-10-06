import Image from "next/image";
import { LockKeyhole, ShieldCheck } from "lucide-react";

export function AuthVisualPanel() {
  return (
    <aside
      className="auth-visual-panel relative hidden h-dvh min-h-0 overflow-hidden min-[900px]:grid"
      aria-label="Vista previa de la plataforma"
      data-testid="auth-visual-panel"
    >
      <div className="auth-visual-panel__glow auth-visual-panel__glow--top" aria-hidden="true" />
      <div className="auth-visual-panel__glow auth-visual-panel__glow--bottom" aria-hidden="true" />

      <div className="auth-visual-panel__stage" data-testid="auth-visual-stage">
        <Image
          className="auth-visual-panel__image"
          src="/plateral-login.webp"
          alt="Vista del panel clínico de HIPOCRATIQ"
          fill
          priority
          sizes="(min-width: 1200px) 54vw, 52vw"
        />
        <div className="auth-visual-panel__stage-shine" aria-hidden="true" />
      </div>

      <div className="auth-visual-panel__security">
        <span className="auth-visual-panel__security-icon" aria-hidden="true">
          <ShieldCheck className="size-5" strokeWidth={1.8} />
        </span>

        <div className="min-w-0">
          <span className="auth-visual-panel__security-kicker">
            <LockKeyhole className="size-3.5" strokeWidth={1.9} aria-hidden="true" />
            Acceso protegido
          </span>
          <h2>Seguridad de grado médico</h2>
          <p>
            Protección de información clínica mediante cifrado, control de acceso, trazabilidad y sesiones seguras,
            preparada para políticas de seguridad y privacidad del entorno sanitario.
          </p>
        </div>
      </div>
    </aside>
  );
}
