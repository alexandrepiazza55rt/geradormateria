// Seções da tela Início (e reutilizadas no modal "Adicionar item").
// Agrupam as categorias de estruturas por tipo de rede.

export interface Secao {
  titulo: string;
  subtitulo: string;
  test: (categoria: string) => boolean;
}

export const SECTIONS: Secao[] = [
  { titulo: "Monofásico", subtitulo: "Rede urbana (planilha)", test: (c) => c.startsWith("Mono") && !c.includes("Rural") && !c.includes("Neutro") },
  { titulo: "Trifásico", subtitulo: "Rede urbana (planilha)", test: (c) => c.startsWith("Tri") && !c.includes("Rural") && !c.includes("Neutro") },
  { titulo: "Rural (NDU 005)", subtitulo: "Estruturas rurais da norma NDU 005", test: (c) => c.includes("Rural") },
  { titulo: "Neutro Contínuo", subtitulo: "Independente de tensão (NDU 005)", test: (c) => c.includes("Neutro") },
  { titulo: "Baixa Tensão", subtitulo: "Rede multiplexada de BT (NDU 004.3)", test: (c) => c.includes("Baixa Tens") && !c.includes("Isolada") },
  { titulo: "BT Isolada", subtitulo: "Rede secundária isolada de BT (NDU 004.3)", test: (c) => c.includes("Isolada") },
  { titulo: "Medições c/ Mureta", subtitulo: "Padrões trifásicos com mureta", test: (c) => c.startsWith("Medi") },
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
