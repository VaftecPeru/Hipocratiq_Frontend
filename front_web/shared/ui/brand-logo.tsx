import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className = "h-10 w-auto", priority = false }: BrandLogoProps) {
  return (
    <Image
      className={`object-contain ${className}`}
      src="/logo_hipocratiq.webp"
      alt=""
      width={1264}
      height={1108}
      priority={priority}
      aria-hidden="true"
    />
  );
}
