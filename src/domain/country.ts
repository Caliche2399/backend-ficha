export interface Country {
  code: string;
  name: string;
  region: string;
  capital: string | null;
  population: number | null;
  areaKm2: number | null;
  currencies: string[];
  languages: string[];
  borders: string[];
}
