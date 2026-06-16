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
];
