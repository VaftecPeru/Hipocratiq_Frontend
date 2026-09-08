import MexicoFlag from "country-flag-icons/react/3x2/MX";
import PeruFlag from "country-flag-icons/react/3x2/PE";
import UnitedStatesFlag from "country-flag-icons/react/3x2/US";

export type CountryCode = "MX" | "PE" | "US";

const FLAGS: Record<CountryCode, typeof MexicoFlag> = {
  MX: MexicoFlag,
  PE: PeruFlag,
  US: UnitedStatesFlag,
};

export function CountryFlag({ countryCode, className }: { countryCode: CountryCode | string; className?: string }) {
  const Flag = FLAGS[countryCode as CountryCode];

  if (!Flag) {
    return <span className={className ?? "inline-grid h-3.5 w-5 shrink-0 place-items-center text-[0.55rem] font-bold leading-none text-muted"} aria-label={countryCode}>{countryCode.toUpperCase()}</span>;
  }

  return <Flag className={className ?? "h-3.5 w-5 shrink-0 rounded-[2px]"} aria-hidden="true" />;
}
