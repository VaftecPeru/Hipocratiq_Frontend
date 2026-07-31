import Link from "next/link";

export const metadata = {
  title: "Seguridad — Hipocratiq",
};

export default function SeguridadPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-ink">Seguridad</h1>
        <p className="text-sm text-footer-text">
          Protegemos tu información con cifrado en tránsito, autenticación por
          sesión y verificación en dos pasos. Si detectas una vulnerabilidad,
          repórtala de forma responsable a nuestro equipo.
        </p>
      </div>

      <div className="flex flex-col gap-2 text-sm text-ink">
        <a href="mailto:seguridad@hipocratiq.com" className="underline transition-colors hover:text-footer-text">
          seguridad@hipocratiq.com
        </a>
      </div>

      <Link href="/" className="text-sm text-footer-text underline transition-colors hover:text-ink">
        Volver al inicio
      </Link>
    </main>
  );
}
