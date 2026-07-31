import Link from "next/link";

export const metadata = {
  title: "Soporte — Hipocratiq",
};

export default function SoportePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-ink">Soporte</h1>
        <p className="text-sm text-footer-text">
          ¿Necesitas ayuda con tu cuenta o con la plataforma? Escríbenos y te
          responderemos lo antes posible.
        </p>
      </div>

      <div className="flex flex-col gap-2 text-sm text-ink">
        <a href="mailto:soporte@hipocratiq.com" className="underline transition-colors hover:text-footer-text">
          soporte@hipocratiq.com
        </a>
      </div>

      <Link href="/" className="text-sm text-footer-text underline transition-colors hover:text-ink">
        Volver al inicio
      </Link>
    </main>
  );
}
