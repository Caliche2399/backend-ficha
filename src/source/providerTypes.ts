export interface ProviderCapital {
  name?: string;
  attributes?: { primary?: boolean };
}

export interface ProviderCountry {
  codes?: { alpha_3?: string };
  names?: { common?: string };
  region?: string;
  capitals?: ProviderCapital[];
  population?: number;
  area?: { kilometers?: number };
  borders?: string[];
  currencies?: { code?: string }[];
  languages?: { name?: string }[];
}

export interface ProviderPage {
  data: {
    objects: ProviderCountry[];
    meta: {
      total: number;
      count: number;
      limit: number;
      offset: number;
      more: boolean;
    };
  };
}

export interface ProviderErrorBody {
  errors: { message: string; code?: string }[];
}
