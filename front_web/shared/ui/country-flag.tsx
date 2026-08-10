import MexicoFlag from "country-flag-icons/react/3x2/MX";
import PeruFlag from "country-flag-icons/react/3x2/PE";
import UnitedStatesFlag from "country-flag-icons/react/3x2/US";

export type CountryCode = "MX" | "PE" | "US";

const FLAGS: Record<CountryCode, typeof MexicoFlag> = {
  MX: MexicoFlag,
  PE: PeruFlag,
  US: UnitedStatesFlag,
};

function countryEmoji(countryCode: string): string {
  const normalized = countryCode.toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return "🌐";

  return String.fromCodePoint(...[...normalized].map((letter) => 127397 + letter.charCodeAt(0)));
}

export function CountryFlag({ countryCode, className }: { countryCode: CountryCode | string; className?: string }) {
  const Flag = FLAGS[countryCode as CountryCode];

  if (!Flag) {
    return <span className={className ?? "inline-grid h-3.5 w-5 shrink-0 place-items-center text-sm leading-none"} aria-label={countryCode}>{countryEmoji(countryCode)}</span>;
  }

  return <Flag className={className ?? "h-3.5 w-5 shrink-0 rounded-[2px]"} aria-hidden="true" />;
}
