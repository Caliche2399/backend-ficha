import type { Country } from "../domain/country.js";
import type { ProviderCapital, ProviderCountry } from "./providerTypes.js";

function pickCapital(capitals: ProviderCapital[] | undefined): string | null {
  const named = (capitals ?? []).filter((c) => c.name);
  const chosen = named.find((c) => c.attributes?.primary) ?? named[0];
  return chosen?.name ?? null;
}

function isText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function numberOrNull(value: number | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function mapCountry(raw: ProviderCountry): Country | null {
  const code = raw.codes?.alpha_3;
  const name = raw.names?.common;
  if (!isText(code) || !isText(name)) {
    return null;
  }

  return {
    code: code.trim().toUpperCase(),
    name,
    region: raw.region ?? "",
    capital: pickCapital(raw.capitals),
    population: numberOrNull(raw.population),
    areaKm2: numberOrNull(raw.area?.kilometers),
    currencies: (raw.currencies ?? []).map((c) => c.code).filter(isText),
    languages: (raw.languages ?? []).map((l) => l.name).filter(isText),
    borders: (raw.borders ?? []).filter(isText).map((b) => b.trim().toUpperCase()),
  };
}

export function mapCountries(raw: ProviderCountry[]): Country[] {
  return raw.flatMap((item) => {
    const country = mapCountry(item);
    return country ? [country] : [];
  });
}
