import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { mapCountries, mapCountry } from "../src/source/mapper.js";
import type { ProviderCountry, ProviderPage } from "../src/source/providerTypes.js";

function loadPage(n: number): ProviderPage {
  const url = new URL(`./fixtures/restcountries-page${n}.json`, import.meta.url);
  return JSON.parse(readFileSync(url, "utf-8")) as ProviderPage;
}

const pages = [1, 2, 3].map(loadPage);
const allRaw = pages.flatMap((p) => p.data.objects);

function rawByCode(code: string): ProviderCountry {
  const found = allRaw.find((c) => c.codes?.alpha_3 === code);
  if (!found) {
    throw new Error(`fixture sin ${code}`);
  }
  return found;
}

describe("mapCountry", () => {
  it("aplana un país completo", () => {
    expect(mapCountry(rawByCode("GTM"))).toEqual({
      code: "GTM",
      name: "Guatemala",
      region: "Americas",
      capital: "Guatemala City",
      population: 18406359,
      areaKm2: 108889,
      currencies: ["GTQ"],
      languages: ["Spanish"],
      borders: ["BLZ", "SLV", "HND", "MEX"],
    });
  });

  it("usa la capital primaria cuando existe", () => {
    const raw: ProviderCountry = {
      codes: { alpha_3: "AAA" },
      names: { common: "Aaa" },
      capitals: [
        { name: "Segunda", attributes: { primary: false } },
        { name: "Principal", attributes: { primary: true } },
      ],
    };
    expect(mapCountry(raw)?.capital).toBe("Principal");
  });

  it("usa la primera capital si ninguna es primaria", () => {
    expect(mapCountry(rawByCode("BOL"))?.capital).toBe("Sucre");
    expect(mapCountry(rawByCode("SWZ"))?.capital).toBe("Mbabane");
  });

  it("devuelve capital null si no hay capitales", () => {
    expect(mapCountry(rawByCode("ATA"))?.capital).toBeNull();
  });

  it("deja listas vacías cuando el proveedor no trae monedas ni idiomas", () => {
    const ata = mapCountry(rawByCode("ATA"));
    expect(ata?.currencies).toEqual([]);
    expect(ata?.languages).toEqual([]);
    expect(ata?.borders).toEqual([]);
  });

  it("conserva población 0 como dato", () => {
    expect(mapCountry(rawByCode("BVT"))?.population).toBe(0);
  });

  it("tolera campos ausentes y normaliza el código", () => {
    const raw: ProviderCountry = {
      codes: { alpha_3: " xyz " },
      names: { common: "Xyz" },
    };
    expect(mapCountry(raw)).toEqual({
      code: "XYZ",
      name: "Xyz",
      region: "",
      capital: null,
      population: null,
      areaKm2: null,
      currencies: [],
      languages: [],
      borders: [],
    });
  });

  it("descarta entradas sin código o sin nombre", () => {
    expect(mapCountry({ codes: { alpha_3: "" }, names: { common: "Abkhazia" } })).toBeNull();
    expect(mapCountry({ codes: { alpha_3: "ABC" } })).toBeNull();
    expect(mapCountry({})).toBeNull();
  });
});

describe("mapCountries", () => {
  it("excluye los territorios sin código alfa-3 de las tres páginas", () => {
    const countries = mapCountries(allRaw);
    expect(allRaw).toHaveLength(254);
    expect(countries).toHaveLength(250);
    expect(countries.every((c) => c.code.length === 3)).toBe(true);
  });

  it("no repite códigos", () => {
    const codes = mapCountries(allRaw).map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("deja todas las fronteras apuntando a países que existen", () => {
    const countries = mapCountries(allRaw);
    const codes = new Set(countries.map((c) => c.code));
    const dangling = countries.flatMap((c) => c.borders.filter((b) => !codes.has(b)));
    expect(dangling).toEqual([]);
  });
});
