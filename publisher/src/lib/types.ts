// Tipos espelhados da base do sistema (app/public/data) e do manifest de update
// (app/src/lib/update/manifest.ts). Mantidos aqui para o painel ser autossuficiente.

export interface PosteOption {
  poste: string;
  delta: Record<string, number>;
}

export interface Estrutura {
  schema_version?: number;
  rev?: number;
  status?: "ativo" | "descontinuado";
  id: string;
  tipo: string;
  condutor: string | null;
  tensao_kv: number;
  nominal_kv: number;
  fases: number;
  categoria: string;
  poste_ref: string;
  base_bom: Record<string, number>;
  postes: PosteOption[];
  // campos opcionais que podem vir da planilha
  sheet?: string;
  col?: string;
  [extra: string]: unknown;
}

export interface ManifestFile {
  name: string; // caminho na base (ex.: "structures/S1.json")
  sha256: string;
  bytes: number;
  asset?: string; // legado (releases achatados); não usado no modo CDN
}

export interface BaseManifest {
  data_version: string;
  files: ManifestFile[];
  notes?: string;
  generated_at?: string;
}

export interface CatalogItem {
  id: string;
  rev: number;
  categoria: string;
  status: "ativo" | "descontinuado";
  file: string;
  bytes: number;
  sha256: string;
}

export interface Catalog {
  schema_version: number;
  data_version: string;
  generated_at?: string;
  structures: CatalogItem[];
}

export interface Material {
  id: number;
  descricao?: string;
  unidade?: string;
  [extra: string]: unknown;
}
