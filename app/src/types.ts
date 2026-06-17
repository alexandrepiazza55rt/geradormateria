// Domain types — mirror the JSON base extracted from the spreadsheet.

export interface Material {
  id: number;
  cod_sap: string;
  cod_lider7: string;
  descricao: string;
  unidade: string;
  categoria?: string;
}

// A "delta" or "bom" is a map of material id -> quantity per unit.
export type BomMap = Record<string, number>;

export interface PosteOption {
  poste: string;     // label, e.g. "DT-10/150"
  delta: BomMap;     // material id -> qty difference vs base_bom
}

export interface Condicional {
  id: number | null;        // material id when resolvable, else null
  descricao: string;        // norm description
  qtd: number;
  condicao: string;         // when/why this item applies
}

export interface Estrutura {
  id: string;
  // Metadados de publicação (base quebrada por arquivo). Ausentes em bases antigas.
  schema_version?: number;
  rev?: number;                       // sobe a cada correção publicada da estrutura
  status?: "ativo" | "descontinuado"; // descontinuado: some da criação, segue resolvível
  sheet?: string;
  col?: string;
  tipo: string;             // e.g. "U1", "N3-CFu", "ESTAI ÂNCORA"
  tipo_base?: string;       // grouping key for rural (e.g. "N3"); urban uses tipo
  cruzeta?: string | null;  // rural cruzeta variation (e.g. "T 1,90 m")
  condutor: string | null;  // "2CAA" | "1/0CAA" | "4/0CAA" | "N8" | "QUANT" | null
  tensao_kv: number;        // 13.8 | 24.2 | 34.5
  classe_tensao_kv?: number;
  nominal_kv: number;
  fases: number;            // 1 | 3
  norma_origem?: string;    // "NDU 005" for rural; absent for urban (spreadsheet)
  poste_ref: string;        // pole label that base_bom corresponds to
  base_bom: BomMap;         // material id -> qty (at reference pole)
  postes: PosteOption[];
  condicionais?: Condicional[];  // items the norm leaves to the project (not summed)
  pagina_origem?: string;
  categoria: string;        // "Monofásico 13,8 kV" | "Trifásico 34,5 kV — Rural (NDU 005)" ...
}

export interface Insumo {
  id: string;
  sheet?: string;
  cell?: string;
  descricao: string;
  unidade?: string;
  postes_por_haste?: number;  // if set, user enters nº de postes; hastes = ceil(postes / this)
  tensao_kv: number;
  fases: number;
  bom: BomMap;
  categoria: string;
}

// A line in the "lista de obra".
export interface ObraItem {
  key: string;            // unique line id
  estruturaId: string;
  posteIdx: number;       // index into estrutura.postes
  quantidade: number;
}

export interface ObraInsumo {
  key: string;
  insumoId: string;
  quantidade: number;
}

// A consolidated BOM row for display/export.
export interface BomRow {
  material: Material;
  quantidade: number;
}
