// Seções da tela Início (e reutilizadas no modal "Adicionar item").
// Agrupam as categorias de estruturas por tipo de rede.

export interface Secao {
  titulo: string;
  subtitulo: string;
  test: (categoria: string) => boolean;
}

export const SECTIONS: Secao[] = [
  { titulo: "Rede MT Monofásica", subtitulo: "Estruturas monofásicas urbanas — 13,8 kV e 34,5 kV", test: (c) => c.startsWith("Mono") && !c.includes("Rural") && !c.includes("Neutro") },
  { titulo: "Rede MT Trifásica", subtitulo: "Estruturas trifásicas urbanas — 13,8 kV e 34,5 kV", test: (c) => c.startsWith("Tri") && !c.includes("Rural") && !c.includes("Neutro") },
  { titulo: "Rural", subtitulo: "Estruturas rurais mono e trifásicas (NDU 005)", test: (c) => c.includes("Rural") },
  { titulo: "Neutro Contínuo", subtitulo: "Rede de neutro contínuo (NDU 005)", test: (c) => c.includes("Neutro") },
  { titulo: "Rede Compacta", subtitulo: "Rede compacta de MT — CE1/CE2/CE3/CE4 e mono (NDU 004.1)", test: (c) => c.includes("Compacta") },
  { titulo: "Transformadores", subtitulo: "Mono e trifásicos de distribuição — 13,8 kV e 34,5 kV", test: (c) => c.startsWith("Transformadores") },
  { titulo: "BT Multiplexada", subtitulo: "Rede secundária multiplexada de baixa tensão (NDU 004.3)", test: (c) => c.includes("Baixa Tens") && !c.includes("Isolada") },
  { titulo: "BT Isolada", subtitulo: "Rede secundária isolada de baixa tensão (NDU 004.3)", test: (c) => c.includes("Isolada") },
  { titulo: "Iluminação Pública", subtitulo: "Estruturas de IP em poste duplo T e circular (NDU 004.3)", test: (c) => c.includes("Ilumina") },
  { titulo: "Medição com Mureta", subtitulo: "Padrão de entrada trifásico com mureta", test: (c) => c.startsWith("Medi") },
];

export interface SecaoComCategorias {
  titulo: string;
  subtitulo: string;
  cats: string[];
}

/**
 * Distribui as categorias nas seções acima. QUALQUER categoria que não se encaixe
 * em nenhuma seção conhecida cai numa seção "Outras redes" — assim dá para criar
 * grupos novos só pelo campo `categoria` do JSON, sem mexer no código.
 */
export function categoriasPorSecao(categorias: string[]): SecaoComCategorias[] {
  const out: SecaoComCategorias[] = SECTIONS.map((s) => ({
    titulo: s.titulo,
    subtitulo: s.subtitulo,
    cats: categorias.filter(s.test),
  }));
  const restantes = categorias.filter((c) => !SECTIONS.some((s) => s.test(c)));
  if (restantes.length > 0) {
    out.push({ titulo: "Outras redes", subtitulo: "Categorias personalizadas", cats: restantes });
  }
  return out.filter((s) => s.cats.length > 0);
}
